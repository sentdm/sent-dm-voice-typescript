# @sentdm/voice-client-core

The shared core of the Sent Voice Client packages: the error family, the typed emitter, logging, the voice
token lifecycle, telemetry and E.164 validation.

It is internal to [`@sentdm/voice-client`](https://www.npmjs.com/package/@sentdm/voice-client) and its React
bindings, which install it for you. Its surface may change in any release, so don't depend on it directly.
