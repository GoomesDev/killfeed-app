import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { sessionSchema } from './contract';

export const sessionStorageKey = 'killfeed.session.v1';

type Credential = { token: string; expires_at: string };

let credential: Credential | null = null;
let hydrationAttempted = false;
let hydrationPromise: Promise<string | null> | null = null;

export function setCredential(value: Credential | null) {
  credential = value;
  hydrationAttempted = true;
}

function currentToken() {
  if (!credential || Date.parse(credential.expires_at) <= Date.now()) {
    return null;
  }
  return credential.token;
}

export async function getSessionToken() {
  const token = currentToken();

  if (token || hydrationAttempted || Platform.OS === 'web') {
    return token;
  }

  if (!hydrationPromise) {
    hydrationPromise = (async () => {
      hydrationAttempted = true;

      try {
        const rawSession = await SecureStore.getItemAsync(sessionStorageKey);
        if (!rawSession) {
          return null;
        }

        const parsedSession = sessionSchema.safeParse(JSON.parse(rawSession));
        if (!parsedSession.success) {
          return null;
        }

        credential = parsedSession.data;
        return currentToken();
      } catch {
        return null;
      }
    })().finally(() => {
      hydrationPromise = null;
    });
  }

  return hydrationPromise;
}
