import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';

let startupSync: Promise<void> | null = null;

export function syncFriendsOnAppOpen() {
  if (startupSync) {
    return startupSync;
  }

  startupSync = api
    .post(endpoints.syncFriends)
    .then(() => undefined)
    .catch(() => undefined);

  return startupSync;
}
