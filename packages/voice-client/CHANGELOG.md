# Changelog

## [0.2.0](https://github.com/sentdm/sent-dm-voice-typescript/compare/voice-client-v0.1.1...voice-client-v0.2.0) (2026-10-23)


### ⚠ BREAKING CHANGES

* tokenProvider must return the token from POST /v3/voice/tokens, and telemetry.baseURL is replaced by the top-level baseURL option, which the token exchange also uses.
* import the React bindings from @sentdm/voice-client-react instead of @sentdm/voice-client/react.
* install @sentdm/voice-client instead of @sentdm/voice.

### Features

* add the Voice Client contract and its conformance test ([fdd7995](https://github.com/sentdm/sent-dm-voice-typescript/commit/fdd7995eb44c7a5ea93f834d24fe34d5f7a31c29))
* exchange the opaque voice token for the provider credential ([e0ec6d7](https://github.com/sentdm/sent-dm-voice-typescript/commit/e0ec6d7248b0d9f8861401752a08433967badf4d))
* extract @sentdm/voice-client-core ([a8cbf69](https://github.com/sentdm/sent-dm-voice-typescript/commit/a8cbf692a9fad8fedb4337df143e5b77f8eba88e))
* move the React bindings to @sentdm/voice-client-react ([3853f65](https://github.com/sentdm/sent-dm-voice-typescript/commit/3853f6522d31ce9a4c865749d8d39c2b6485adf7))
* publish as @sentdm/voice-client from a pnpm workspace ([cdd8b0c](https://github.com/sentdm/sent-dm-voice-typescript/commit/cdd8b0cf0bb57549816f9acf99fe4725e10ecf70))


### Bug Fixes

* ignore call updates once the call has ended ([e33c825](https://github.com/sentdm/sent-dm-voice-typescript/commit/e33c8258a7ab282292fefafa1954353d175c67ef))


### Documentation

* keep the units on CallStats after its move to core ([590df75](https://github.com/sentdm/sent-dm-voice-typescript/commit/590df759d0aa377d84ec875b00fdb768615f536b))


### Build System

* bundle sinch-rtc into the voice client ([9db8bbb](https://github.com/sentdm/sent-dm-voice-typescript/commit/9db8bbbc56c307cb08def1c3973fbbfeab68fa47))

## [0.1.1](https://github.com/sentdm/sent-dm-voice-sdk/compare/v0.1.0...v0.1.1) (2026-09-29)


### Chores

* publish through npm trusted publishing only ([5e1e674](https://github.com/sentdm/sent-dm-voice-sdk/commit/5e1e6747ade2fc2a5acf028a9a0dc21d17f59d61))

## [0.1.0](https://github.com/sentdm/sent-dm-voice-sdk/compare/v0.0.1...v0.1.0) (2026-09-29)


### Features

* add calls and incoming call invites with connect and joinConference ([d11ab9c](https://github.com/sentdm/sent-dm-voice-sdk/commit/d11ab9c601ee9a051e92fa4dbace964f624c01b4))
* add provider quality warnings and reconnects, the README and the npm release pipeline ([e304bb3](https://github.com/sentdm/sent-dm-voice-sdk/commit/e304bb357aa363878f266bd68e094853f2776fba))
* add the audio controller with device selection and deviceChanged ([d1ceda1](https://github.com/sentdm/sent-dm-voice-sdk/commit/d1ceda1dcafc777bcf30f58179b18b51a0753c08))
* add the provider adapter seam and a scriptable mock adapter ([a06388d](https://github.com/sentdm/sent-dm-voice-sdk/commit/a06388dbd17465346b834818d8f613b57985d65b))
* add the React provider and hooks with activeCallChanged and invite events ([409fc94](https://github.com/sentdm/sent-dm-voice-sdk/commit/409fc940c747b785e8e8c3436ba37945df8fb8a9))
* add the SentVoice client with registration and token refresh ([244b73c](https://github.com/sentdm/sent-dm-voice-sdk/commit/244b73cf196bc7898d067679ff7a3a025b8b4bc4))
* add the Sinch adapter with incoming-call push and call audio ([afe794d](https://github.com/sentdm/sent-dm-voice-sdk/commit/afe794d6ec5c8946b7f32b46a057a2f697d521e4))
* add the telemetry module with batched usage and call quality reports ([c8c701e](https://github.com/sentdm/sent-dm-voice-sdk/commit/c8c701e6c7fe1e9644fb5596bb5a40847bd1f0de))
* scaffold @sentdm/voice with the error family and a typed emitter ([54eae6e](https://github.com/sentdm/sent-dm-voice-sdk/commit/54eae6eb8a305688ac74573f3e6a35b00cb929f4))


### Bug Fixes

* identity namespace, telemetry logs ([8748cc3](https://github.com/sentdm/sent-dm-voice-sdk/commit/8748cc370ef4a70d8ab6e2b59f82db79f9334aee))


### Chores

* publish @sentdm/voice as a public package ([ac84a9b](https://github.com/sentdm/sent-dm-voice-sdk/commit/ac84a9b86b59a864da05ae6b9be3f000abbe055d))


### Documentation

* new token route, phone leg cap, telemetry 404 tolerance ([96ff8d9](https://github.com/sentdm/sent-dm-voice-sdk/commit/96ff8d9ff2fe93359dc5d2d0920c5f9e479ab8bb))
