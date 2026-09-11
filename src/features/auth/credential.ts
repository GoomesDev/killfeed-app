let credential: { token: string; expires_at: string } | null = null;

export function setCredential(value: { token: string; expires_at: string } | null) {
  credential = value;
}

export function getSessionToken() {
  if (!credential || Date.parse(credential.expires_at) <= Date.now()) return null;
  return credential.token;
}
