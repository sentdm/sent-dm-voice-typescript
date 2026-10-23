# Browser phone

A one-page phone on the Voice Client in this repository. It runs the SDK from source, so you can try an SDK change, or a Sent API that isn't in production yet, before a release.

## Run it

You need a Sent account with a voice number that has phone calls on, and an API key for that account.

```sh
pnpm install                 # from the repository root
cd examples/browser-phone
cp .env.example .env         # set SENT_API_KEY, and SENT_API_BASE_URL to try another API
pnpm dev
```

`pnpm dev` builds the SDK packages, then serves the page at http://localhost:5173. The Vite dev server is the backend too: `vite.config.ts` mints a voice token for the identity the page names with `POST /v3/voice/tokens`, and serves the SDK's service worker at `/sw.js`. The page hands the token to the SDK, which exchanges it at `SENT_API_BASE_URL`.

1. Enter an identity, such as `alice`, and select **Go online**. Allow notifications and the microphone.
2. Go online as `bob` in a second browser or browser profile. Incoming calls arrive through a service worker, and a browser profile has one per origin, so a second tab won't do. `pnpm dev --port 5174` serves a second copy on an origin of its own.
3. Call `bob` from `alice`, or dial a phone number in E.164 format, such as `+14155551234`.

What happens to a call depends on the voice number it belongs to:

- With a callback URL, Sent asks your backend what to do, and its answer decides what rings.
- Without one, a call from the page connects straight to the number or identity it dials, and calls to the number are declined.

The events list shows each client and call event as it happens, with the error code when something fails.
