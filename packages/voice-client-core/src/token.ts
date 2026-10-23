import { apiURL } from './api';
import { NetworkError, TokenInvalidError } from './errors';

/** A Sent voice token from the app's backend, with what Sent exchanged it for. */
export interface VoiceToken {
  /** The `vt_` token the app's backend minted. Authenticates the SDK's own calls to Sent. */
  token: string;
  /** What the adapter registers with the calling provider. Opaque here and never shown to the app. */
  credential: string;
  identity: string;
  number: string;
  /** What the provider ids of the account's users and rooms start with, separator included; see `qualify`. */
  prefix: string;
  issuedAt: number;
  expiresAt: number;
}

/**
 * The id the provider knows a user or room by: the account's prefix, as the exchange hands it over with
 * its separator, then the bare name. Sent owns the format, so nothing here depends on its shape.
 */
export const qualify = (prefix: string, name: string): string => prefix + name;

/** The bare name behind one of this account's ids, or undefined when the id is not one of ours. */
export function unqualify(prefix: string, qualified: string): string | undefined {
  return qualified.length > prefix.length && qualified.startsWith(prefix) ?
      qualified.slice(prefix.length)
    : undefined;
}

/** When a token is refreshed and how failed fetches are retried. Part of the Voice Client contract. */
export const tokenTiming = {
  /** Refresh at this share of the token's lifetime... */
  refreshShare: 0.8,
  /** ...but at least this long before it expires, and never before half its lifetime. */
  refreshMarginMs: 30_000,
  /** The first retry after a failed fetch, doubling up to the maximum. */
  initialRetryDelayMs: 500,
  maxRetryDelayMs: 8_000,
  /** How often an offline client tries again. */
  offlineRetryIntervalMs: 30_000,
} as const;

const exchangePath = '/v3/voice/tokens/exchange';

/**
 * Gets a voice token from the app's backend and exchanges it with Sent for the credential the adapter
 * registers with. A token Sent refuses is invalid, so it is not retried. Any other failure, such as not
 * reaching Sent, a rate limit or a server error, is a network error, which the client retries.
 */
export async function fetchToken(
  tokenProvider: () => Promise<string>,
  baseURL: string | undefined,
): Promise<VoiceToken> {
  let token: unknown;
  try {
    token = await tokenProvider();
  } catch {
    throw new NetworkError({ message: 'The token provider failed to fetch a voice token.' });
  }
  if (!isText(token)) throw new TokenInvalidError();

  let response: Response;
  try {
    // No body, so no Content-Type: the API refuses one on a request without a body.
    response = await fetch(apiURL(baseURL, exchangePath), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new NetworkError({ message: 'Sent could not be reached to exchange the voice token.' });
  }
  if (response.status === 401 || response.status === 403) throw new TokenInvalidError();
  if (!response.ok) {
    throw new NetworkError({ message: `Sent could not exchange the voice token (HTTP ${response.status}).` });
  }

  return readExchange(token, await response.json().catch(() => undefined));
}

const isText = (value: unknown): value is string => typeof value === 'string' && value !== '';

function readExchange(token: string, body: unknown): VoiceToken {
  const data: Record<string, unknown> = (body as { data?: Record<string, unknown> } | undefined)?.data ?? {};
  const { credential, identity, number, prefix, issued_at: issued, expires_at: expires } = data;
  const issuedAt = isText(issued) ? Date.parse(issued) : NaN;
  const expiresAt = isText(expires) ? Date.parse(expires) : NaN;

  if (
    !isText(credential) ||
    !isText(identity) ||
    !isText(number) ||
    !isText(prefix) ||
    !(expiresAt > issuedAt)
  ) {
    throw new NetworkError({
      message: 'Sent answered the voice token exchange with an unexpected response.',
    });
  }

  return { token, credential, identity, number, prefix, issuedAt, expiresAt };
}

export function refreshDelay({ issuedAt, expiresAt }: VoiceToken): number {
  const lifetime = expiresAt - issuedAt;
  return Math.max(
    Math.min(lifetime * tokenTiming.refreshShare, lifetime - tokenTiming.refreshMarginMs),
    lifetime / 2,
  );
}

export function retryDelay(retry: number): number {
  return Math.min(tokenTiming.initialRetryDelayMs * 2 ** retry, tokenTiming.maxRetryDelayMs) * jitter();
}

export function offlineRetryDelay(): number {
  return tokenTiming.offlineRetryIntervalMs * jitter();
}

function jitter(): number {
  return 1 - Math.random() * 0.25;
}
