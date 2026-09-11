import { z } from 'zod';

export const redirectUri = 'killfeedmobile://auth/callback';
export const sessionSchema = z.object({
  token: z.string().min(1),
  token_type: z.literal('Bearer'),
  expires_at: z.string().datetime({ offset: true }),
});
export const exchangeSchema = sessionSchema.extend({
  user: z.object({
    id: z.number().int().positive(), steam_id: z.string(), display_name: z.string(),
    username: z.string().nullable(), avatar: z.string().nullable(),
    profile_url: z.string().nullable(), is_active: z.literal(true),
  }),
});

export function parseCallback(value: string, state: string, startedAt: number) {
  // React Native's built-in URL parser does not support custom-scheme host/path.
  if (!value.startsWith(`${redirectUri}?`) || value.includes('#') ||
      Date.now() - startedAt >= 600000) throw new Error('Tentativa inválida ou expirada. Entre novamente.');
  const params = new URLSearchParams(value.slice(redirectUri.length + 1));
  if ([...params.keys()].some((key) => !['state', 'code', 'error'].includes(key) || params.getAll(key).length !== 1) ||
      params.get('state') !== state || params.has('code') === params.has('error')) {
    throw new Error('Retorno de autenticação inválido. Entre novamente.');
  }
  if (params.has('error')) {
    const messages: Record<string, string> = {
      access_denied: 'Login cancelado.', attempt_expired: 'Tentativa expirada. Entre novamente.',
      authentication_failed: 'A Steam não confirmou o login. Tente novamente.',
    };
    throw new Error(messages[params.get('error') ?? ''] ?? 'Falha na autenticação. Tente novamente.');
  }
  const code = params.get('code');
  if (!code || !/^[a-f0-9]{64}$/.test(code)) throw new Error('Código de autenticação inválido.');
  return code;
}
