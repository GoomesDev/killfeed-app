import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { z } from 'zod';

import { syncFriendsOnAppOpen } from '@/features/friends/sync';
import { useAuthStore } from '@/stores/authStore';

import { sessionSchema, exchangeSchema } from './contract';
import { sessionStorageKey, setCredential } from './credential';

const savedSessionSchema = sessionSchema.extend({
  userId: z.number().int().positive(),
});

export { getSessionToken } from './credential';
export async function saveSession(value: unknown) {
  const exchanged = exchangeSchema.parse(value);
  const session = {
    ...sessionSchema.parse(exchanged),
    userId: exchanged.user.id,
  };
  if (Date.parse(session.expires_at) <= Date.now()) {
    throw new Error('A sessão recebida já expirou.');
  }
  await SecureStore.setItemAsync(sessionStorageKey, JSON.stringify(session), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  setCredential(session);
  useAuthStore.setState({
    status: 'authenticated',
    userId: session.userId,
    message: 'Login concluído. Sessão salva com segurança.',
  });
  void syncFriendsOnAppOpen();
}
export async function restoreSession() {
  if (useAuthStore.getState().status !== 'restoring') {
    return;
  }
  if (Platform.OS === 'web') {
    useAuthStore.setState({ status: 'idle', message: null });
    return;
  }
  try {
    const raw = await SecureStore.getItemAsync(sessionStorageKey);
    if (raw) {
      const parsed = savedSessionSchema.safeParse(JSON.parse(raw));
      if (parsed.success && Date.parse(parsed.data.expires_at) > Date.now()) {
        setCredential(parsed.data);
        useAuthStore.setState({
          status: 'authenticated',
          userId: parsed.data.userId,
          message: 'Sessão salva neste dispositivo.',
        });
        void syncFriendsOnAppOpen();
        return;
      }
      await SecureStore.deleteItemAsync(sessionStorageKey);
    }
    useAuthStore.setState({ status: 'idle', message: null });
  } catch {
    useAuthStore.setState({
      status: 'idle',
      message: 'Não foi possível restaurar a sessão. Entre novamente.',
    });
  }
}
