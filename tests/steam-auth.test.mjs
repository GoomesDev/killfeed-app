import assert from 'node:assert/strict';
import test from 'node:test';
import { parseCallback, exchangeSchema } from '../src/features/auth/contract.ts';
const state = 'a'.repeat(64);
const code = 'b'.repeat(64);
const valid = `killfeedmobile://auth/callback?state=${state}&code=${code}`;
test('accepts a bound callback', () => assert.equal(parseCallback(valid, state, Date.now()), code));
test('rejects unsolicited, expired and ambiguous callbacks', () => {
  for (const url of [valid.replace(state, 'c'.repeat(64)), valid + '&state=other', valid + '&error=access_denied', valid.replace('auth/', 'other/'), valid.replace('killfeedmobile:', 'https:')]) {
    assert.throws(() => parseCallback(url, state, Date.now()));
  }
  assert.throws(() => parseCallback(valid, state, Date.now() - 600001));
});
test('handles cancellation and rejects malformed exchange response', () => {
  assert.throws(() => parseCallback(`killfeedmobile://auth/callback?state=${state}&error=access_denied`, state, Date.now()), /cancelado/);
  assert.equal(exchangeSchema.safeParse({ token: 'token', expires_at: 'tomorrow' }).success, false);
});

test('callback validation does not depend on native URL custom-scheme support', () => {
  const original = globalThis.URL;
  try {
    globalThis.URL = class { constructor() { throw new Error('Custom schemes unsupported'); } };
    assert.equal(parseCallback(valid, state, Date.now()), code);
    for (const invalid of [valid.replace('/callback?', '/callback/?'), valid + '#fragment', valid.replace('auth/', 'auth:80/'), valid.replace('auth/', 'user@auth/')]) {
      assert.throws(() => parseCallback(invalid, state, Date.now()));
    }
  } finally { globalThis.URL = original; }
});
