# Voice Client contract

`voice-client.json` is what every Sent Voice Client SDK agrees on, whatever its platform: error codes and
their classes, client and call states, the transitions a call may make, event names, token timing and
telemetry fields. The web packages here are checked against it on every test run
(`packages/voice-client/tests/contract.test.ts`), and the native SDKs pin a version of it and generate their
constants from it.

Changing the contract is a versioned change: bump `version` with semver (a removed or renamed value is a
major bump), and change the code in the same PR so the conformance test passes.
