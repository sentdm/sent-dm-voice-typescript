import { unqualify } from '@sentdm/voice-client-core';

export const prefix = '0f8fad5b-d9cb-469f-a165-70867728950e';
const issuer = '//rtc.sinch.com/applications/0bb6f5e2-5ad1-4c3b-8b1b-5a0c1d2e3f40';
const exchangePath = '/v3/voice/tokens/exchange';
export const exchangeURL = `https://api.sent.dm${exchangePath}`;

const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
const header = encode({ alg: 'HS256', typ: 'JWT', kid: 'hkdfv1-20260922' });
const payloadOf = (token: string) => token.slice('vt_'.length, token.lastIndexOf('.'));

/**
 * Stands in for the `vt_` token `POST /v3/voice/tokens` mints, issued now and valid for 600 s. The real
 * one is opaque; this one carries the claims of the credential the fake exchange answers with, so a test
 * shapes both through one argument.
 */
export function voiceToken(claims: Record<string, unknown> = {}): string {
  const iat = Math.floor(Date.now() / 1000);
  return `vt_${encode({
    iss: issuer,
    sub: `${issuer}/users/${prefix}_agent-42`,
    iat,
    exp: iat + 600,
    nonce: '9f86d081884c7d659a2feaa0c55ad015',
    'sent:number': '+38349111222',
    ...claims,
  })}.${encode('signature')}`;
}

/** The credential the fake exchange answers `token` with: a provider JWT with the same claims. */
export const credentialFor = (token: string): string =>
  `${header}.${payloadOf(token)}.${encode('signature')}`;

/** A provider credential shaped like the ones the exchange answers with. */
export const providerCredential = (claims: Record<string, unknown> = {}): string =>
  credentialFor(voiceToken(claims));

/** A plain stand-in for a fetch `Response`, which needs no stream and so works under fake timers. */
export const response = (status: number, body: unknown = {}): Response =>
  ({ ok: status >= 200 && status < 300, status, json: async () => body }) as Response;

/** Answers `POST /v3/voice/tokens/exchange` as Sent does, for a token from `voiceToken`: 401 for anything else. */
export async function exchange(_url: string, init?: RequestInit): Promise<Response> {
  const authorization = (init?.headers as Record<string, string> | undefined)?.['Authorization'] ?? '';
  const token = authorization.replace(/^Bearer /, '');
  if (!token.startsWith('vt_')) return response(401);

  const {
    sub,
    iat,
    exp,
    'sent:number': number,
  } = JSON.parse(Buffer.from(payloadOf(token), 'base64url').toString());
  const userId = String(sub).slice(`${issuer}/users/`.length);
  const accountPrefix = userId.slice(0, userId.indexOf('_') + 1);
  return response(200, {
    success: true,
    data: {
      credential: credentialFor(token),
      identity: unqualify(accountPrefix, userId),
      number,
      prefix: accountPrefix,
      issued_at: new Date(Number(iat) * 1000).toISOString(),
      expires_at: new Date(Number(exp) * 1000).toISOString(),
    },
  });
}

/** `fetch` that sends exchanges to the fake and everything else to `other`. */
export const withExchange =
  (other: (url: string, init: RequestInit) => Promise<Response>) =>
  (url: string, init: RequestInit): Promise<Response> =>
    url.endsWith(exchangePath) ? exchange(url, init) : other(url, init);
