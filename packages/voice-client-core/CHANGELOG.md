# Changelog

## [0.2.1](https://github.com/sentdm/sent-dm-voice-typescript/compare/voice-client-core-v0.2.0...voice-client-core-v0.2.1) (2026-10-23)


### Chores

* **voice-client-core:** Synchronize voice-client versions

## [0.2.0](https://github.com/sentdm/sent-dm-voice-typescript/compare/voice-client-core-v0.1.1...voice-client-core-v0.2.0) (2026-10-23)


### ⚠ BREAKING CHANGES

* tokenProvider must return the token from POST /v3/voice/tokens, and telemetry.baseURL is replaced by the top-level baseURL option, which the token exchange also uses.

### Features

* add the Voice Client contract and its conformance test ([fdd7995](https://github.com/sentdm/sent-dm-voice-typescript/commit/fdd7995eb44c7a5ea93f834d24fe34d5f7a31c29))
* exchange the opaque voice token for the provider credential ([e0ec6d7](https://github.com/sentdm/sent-dm-voice-typescript/commit/e0ec6d7248b0d9f8861401752a08433967badf4d))
* extract @sentdm/voice-client-core ([a8cbf69](https://github.com/sentdm/sent-dm-voice-typescript/commit/a8cbf692a9fad8fedb4337df143e5b77f8eba88e))


### Documentation

* keep the units on CallStats after its move to core ([590df75](https://github.com/sentdm/sent-dm-voice-typescript/commit/590df759d0aa377d84ec875b00fdb768615f536b))
