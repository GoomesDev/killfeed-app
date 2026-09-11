import { create } from 'axios';

import { getSessionToken } from '@/features/auth/credential';

export const api = create({
  baseURL: process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, ''),
  timeout: 10000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  if (!config.baseURL || !/^https?:\/\//.test(config.baseURL)) {
    throw new Error(
      'Configure EXPO_PUBLIC_API_URL com a origem HTTP(S) do Laravel.',
    );
  }
  const token = await getSessionToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
