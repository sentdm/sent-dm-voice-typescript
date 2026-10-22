const defaultBaseURL = 'https://api.sent.dm';

/** The URL of a Sent API route, under the app's `baseURL` when it set one. */
export function apiURL(baseURL: string | undefined, path: string): string {
  const base = baseURL || defaultBaseURL;
  return base + (base.endsWith('/') ? path.slice(1) : path);
}
