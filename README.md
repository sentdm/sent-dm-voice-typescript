# Sent Voice Client for TypeScript

Calls for the people in your app: place, answer and manage phone and in-app calls from the browser, with
React bindings.

| Package                                                     | What it is                                                                                 |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [`@sentdm/voice-client`](packages/voice-client)             | The web client: register, place and answer calls, audio devices, incoming-call alerts      |
| [`@sentdm/voice-client-react`](packages/voice-client-react) | React bindings: a provider and hooks that re-render on call events                         |
| [`@sentdm/voice-client-core`](packages/voice-client-core)   | The shared core of both: errors, events, tokens, telemetry. Internal to them, not for apps |

Read the [Voice docs](https://docs.sent.dm) to get started.

## Develop

This is a pnpm workspace. Packages build in dependency order (`scripts/utils/packages`), each one against
the built output of the ones before it.

```sh
./scripts/bootstrap   # install
./scripts/test        # build every package, then run the tests
./scripts/lint        # prettier, eslint, types, Are The Types Wrong? and publint
```

Releases are cut by release-please from `main` and published to npm from GitHub Actions.
