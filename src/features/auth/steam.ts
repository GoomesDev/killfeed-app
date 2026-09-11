import { isAxiosError } from 'axios';
import Constants from 'expo-constants';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/stores/authStore';

import { exchangeSchema, parseCallback, redirectUri } from './contract';
import { saveSession } from './session';

let attempt: { state: string; verifier: string; startedAt: number } | null =
  null;
let completion: Promise<void> | null = null;
let running = false;

class LoginSetupError extends Error {}

export const nativeLoginSupported =
  Platform.OS !== 'web' && Constants.appOwnership !== 'expo';

export async function completeSteamLogin(url: string) {
  if (completion) {
    return completion;
  }
  if (!attempt) {
    return;
  }
  const current = attempt;
  completion = (async () => {
    try {
      const code = parseCallback(url, current.state, current.startedAt);
      useAuthStore.setState({ status: 'exchanging', message: null });
      const response = await api.post<unknown>(endpoints.steamExchange, {
        code,
        code_verifier: current.verifier,
        redirect_uri: redirectUri,
      });
      const session = exchangeSchema.parse(response.data);
      await saveSession(session);
      queryClient.setQueryData(['auth', 'identity'], session.user);
    } catch (error) {
      const message = isAxiosError(error)
        ? `Não foi possível concluir a troca${error.response ? ` (HTTP ${error.response.status})` : ''}. Inicie um novo login.`
        : error instanceof Error && !('issues' in error)
          ? error.message
          : 'Resposta de autenticação inválida.';
      useAuthStore.setState({ status: 'idle', message });
    } finally {
      attempt = null;
    }
  })();
  return completion;
}

export async function startSteamLogin() {
  if (running) {
    return;
  }
  running = true;
  completion = null;
  try {
    if (!nativeLoginSupported) {
      throw new LoginSetupError(
        'Use uma build nativa do Killfeed para entrar com Steam.',
      );
    }
    const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
    if (!configuredUrl) {
      throw new LoginSetupError(
        'A URL da API não foi configurada nesta build. Configure EXPO_PUBLIC_API_URL no EAS e gere um novo APK.',
      );
    }
    let origin: URL;
    try {
      origin = new URL(configuredUrl);
    } catch {
      throw new LoginSetupError(
        'A URL da API desta build é inválida. Configure uma origem HTTP(S) sem /api.',
      );
    }
    if (
      !['http:', 'https:'].includes(origin.protocol) ||
      origin.username ||
      origin.password ||
      origin.pathname !== '/' ||
      origin.search ||
      origin.hash
    ) {
      throw new LoginSetupError(
        'Configure a origem Laravel em EXPO_PUBLIC_API_URL, sem /api.',
      );
    }
    useAuthStore.setState({ status: 'opening', message: null });
    const random = async () =>
      Array.from(await Crypto.getRandomBytesAsync(32), (b) =>
        b.toString(16).padStart(2, '0'),
      ).join('');
    const verifier = await random();
    const state = await random();
    const challenge = (
      await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        verifier,
        { encoding: Crypto.CryptoEncoding.BASE64 },
      )
    )
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    attempt = { state, verifier, startedAt: Date.now() };
    const url = new URL(endpoints.steamRedirect, origin);
    url.search = new URLSearchParams({
      redirect_uri: redirectUri,
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    }).toString();
    const result = await WebBrowser.openAuthSessionAsync(
      url.toString(),
      redirectUri,
    );
    if (result.type === 'success') {
      await completeSteamLogin(result.url);
    } else if (completion) {
      await completion;
    } else {
      useAuthStore.setState({
        status: 'idle',
        message: 'Login cancelado. Você pode tentar novamente.',
      });
    }
  } catch (error) {
    useAuthStore.setState({
      status: 'idle',
      message:
        error instanceof LoginSetupError
          ? error.message
          : 'Não foi possível iniciar a autenticação no navegador. Tente novamente.',
    });
  } finally {
    attempt = null;
    running = false;
  }
}
