import { redirectUri } from '@/features/auth/contract';
import { completeSteamLogin } from '@/features/auth/steam';

// Consume auth URLs before routing so codes never become route parameters.
export async function redirectSystemPath({
  path,
}: {
  path: string;
  initial: boolean;
}) {
  try {
    if (path === redirectUri || path.startsWith(`${redirectUri}?`)) {
      await completeSteamLogin(path);
      return '/';
    }
    return path;
  } catch {
    return '/';
  }
}
