// The browser phone's backend, as a Vite plugin: it mints voice tokens with your API key, so the key
// never reaches the browser, and serves the service worker the SDK ships.
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { defineConfig, loadEnv, type Plugin } from 'vite';

const require = createRequire(import.meta.url);

function sentVoiceBackend(apiKey: string, apiBaseURL: string): Plugin {
  return {
    name: 'sent-voice-backend',
    configureServer(server) {
      // The SDK registers sw.js next to the page. This is the copy @sentdm/voice-client ships.
      server.middlewares.use('/sw.js', async (_req, res) => {
        res.setHeader('Content-Type', 'text/javascript');
        res.end(await readFile(require.resolve('@sentdm/voice-client/sw.js')));
      });

      // The page's tokenProvider calls this. A real backend mints for the user who is signed in. Here
      // the page names the identity, so two browsers can be two users.
      server.middlewares.use('/api/voice-token', async (req, res) => {
        const identity = new URL(req.url ?? '/', 'http://localhost').searchParams.get('identity');
        const response = await fetch(`${apiBaseURL.replace(/\/$/, '')}/v3/voice/tokens`, {
          method: 'POST',
          headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ identity }),
        });
        const body = await response.text();
        res.statusCode = response.status;
        res.end(response.ok ? (JSON.parse(body) as { data: { token: string } }).data.token : body);
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (!env['SENT_API_KEY']) throw new Error('Set SENT_API_KEY in examples/browser-phone/.env');
  const apiBaseURL = env['SENT_API_BASE_URL'] || 'https://api.sent.dm';
  return {
    define: { __SENT_API_BASE_URL__: JSON.stringify(apiBaseURL) },
    plugins: [sentVoiceBackend(env['SENT_API_KEY'], apiBaseURL)],
  };
});
