import { NetworkError, TokenInvalidError, fetchToken } from '@sentdm/voice-client-core';
import { credentialFor, exchangeURL, prefix, providerCredential, response, voiceToken } from './voice-token';

const answer = (status: number, body?: unknown) =>
  jest.spyOn(globalThis, 'fetch').mockResolvedValue(response(status, body));

const exchanged = {
  credential: providerCredential(),
  identity: 'agent-42',
  number: '+38349111222',
  prefix: `${prefix}_`,
  issued_at: '2026-09-22T12:00:00.000Z',
  expires_at: '2026-09-22T12:10:00.000Z',
};

describe('fetchToken', () => {
  afterEach(() => jest.restoreAllMocks());

  test('exchanges the token with Sent for the credential, identity, number, prefix with its separator and lifetime in ms', async () => {
    const token = voiceToken({ iat: 1_790_078_400, exp: 1_790_079_000 });
    const fetch = jest.spyOn(globalThis, 'fetch');

    await expect(fetchToken(async () => token, undefined)).resolves.toEqual({
      token,
      credential: credentialFor(token),
      identity: 'agent-42',
      number: '+38349111222',
      prefix: `${prefix}_`,
      issuedAt: 1_790_078_400_000,
      expiresAt: 1_790_079_000_000,
    });
    expect(fetch).toHaveBeenCalledWith(exchangeURL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  });

  test('exchanges under the base URL the app set', async () => {
    const fetch = jest.spyOn(globalThis, 'fetch');

    await fetchToken(async () => voiceToken(), 'https://staging.example/');

    expect(fetch).toHaveBeenCalledWith('https://staging.example/v3/voice/tokens/exchange', expect.anything());
  });

  test('a token provider that fails is a network error', async () => {
    await expect(
      fetchToken(() => Promise.reject(new TypeError('Failed to fetch')), undefined),
    ).rejects.toThrow(NetworkError);
  });

  test.each([[undefined], [''], [42]])(
    'a token provider value that is not a string token, %p, is invalid',
    async (value) => {
      await expect(fetchToken(async () => value as string, undefined)).rejects.toThrow(TokenInvalidError);
    },
  );

  test.each([401, 403])(
    'a token Sent refuses with HTTP %i is invalid, so it is not retried',
    async (status) => {
      answer(status);

      await expect(fetchToken(async () => voiceToken(), undefined)).rejects.toThrow(TokenInvalidError);
    },
  );

  test.each([404, 429, 500, 503])('HTTP %i is a network error, which the client retries', async (status) => {
    answer(status);

    await expect(fetchToken(async () => voiceToken(), undefined)).rejects.toThrow(NetworkError);
  });

  test('not reaching Sent is a network error', async () => {
    jest.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(fetchToken(async () => voiceToken(), undefined)).rejects.toThrow(NetworkError);
  });

  test.each<[string, unknown]>([
    ['no body', undefined],
    ['no data', { success: true }],
    ['no credential', { data: { ...exchanged, credential: '' } }],
    ['no identity', { data: { ...exchanged, identity: undefined } }],
    ['no number', { data: { ...exchanged, number: 42 } }],
    ['no prefix', { data: { ...exchanged, prefix: '' } }],
    ['an unreadable expiry', { data: { ...exchanged, expires_at: 'soon' } }],
    ['an expiry that is not after the issue', { data: { ...exchanged, expires_at: exchanged.issued_at } }],
  ])('an answer with %s is a network error', async (_, body) => {
    answer(200, body);

    await expect(fetchToken(async () => voiceToken(), undefined)).rejects.toThrow(NetworkError);
  });
});
