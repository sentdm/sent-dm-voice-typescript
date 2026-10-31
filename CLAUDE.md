# Working in this repository

Context for contributors, human or AI, on how this SDK is put together and
the things reviews come back to. [REVIEW.md](REVIEW.md) is the rubric a
reviewer applies.

## Overview

The Sent Voice Client for TypeScript: `@sentdm/voice-client` (the web
client), `@sentdm/voice-client-react` (provider and hooks) and
`@sentdm/voice-client-core` (the shared core of both, not for apps). One pnpm
workspace, hand-written: nothing here is generated, and every line is
reviewed as written. The three packages share one version (release-please
`linked-versions`), are released from `main` under the `voice-client-v*`
tags and published to npm from GitHub Actions with trusted publishing and
provenance.

### Who owns which files

- **`contract/voice-client.json`** is what every Sent Voice Client SDK agrees
  on: error codes and classes, client and call states, the transitions a
  call may make, event names, token timing, telemetry fields. The web
  packages are checked against it on every test run, and the native SDKs
  pin a version of it. A change to it is a versioned change: bump `version`
  with semver (a removed or renamed value is a major), and change the code
  in the same PR so the conformance test passes.
- **release-please-owned**: `CHANGELOG.md` in each package,
  `.release-please-manifest.json` and `packages/voice-client/src/version.ts`.
  They are rewritten in each release PR.
- **`docs/`** is internal working notes (the 1.0 freeze checklist, adapter
  findings). Nothing in it is part of the public surface.
- **`examples/browser-phone`** runs the packages from source; keep it
  building when the public surface moves.

### Branches

- PRs target `main`.
- Branches named `release-please--branches--main` belong to release-please.
  Don't push to them or merge into them. Merging the release PR publishes
  all three packages.

## Build, test, lint

The entry points are `./scripts/bootstrap`, `./scripts/test`, `./scripts/lint`
and `./scripts/format`. Use them rather than calling the toolchain directly,
they pin the versions CI uses (Node 20, pnpm 10). Packages build in
dependency order (`scripts/utils/packages`), each against the built output
of the ones before it; `./scripts/test` builds first, then runs jest.
Nothing in a default run calls Sent's servers.

## Breaking changes

- **Anything a user can import or call without a private marker is public,**
  documented or not. New names start private and are made public on purpose.
  `@sentdm/voice-client-core` is internal to the other two packages; its
  surface is still public to anyone who installed it.
- **Runtime behaviour is the contract.** A change only a type checker notices
  isn't breaking. A change in what the code does at runtime is, even when
  every signature stays the same, and so is a change to
  `contract/voice-client.json` that removes or renames a value.
- **Keep old code working.** A rename or a removal keeps an alias. A
  behaviour change users could depend on waits for a deprecation cycle or
  the next major version.
- **A major version is a maintainer's call.** Describe the compatibility
  impact in the PR instead of deciding it in the commit type.
- **A fix to the web client is a fix to the React bindings** when they
  expose the same thing; change both in one PR.

## Commits and pull requests

- **Conventional Commits drive release-please**: `feat:`, `fix:`,
  `chore:`, `docs:`. The subject becomes the changelog line customers read,
  so write it for them: what changed, and what to do about it. Never an
  internal cause.
- **`ci:` and `test:` are hidden from the changelog.** `chore:`, `docs:`,
  `feat:` and `fix:` are not, and any of them cuts a release of all three
  packages when the release PR is merged.
- **One logical change per PR.** A behaviour change that the native Voice
  Client SDKs share goes to them too; link the sibling PRs.
- **The description says** what was wrong, with a before-and-after example,
  what changed, and how you know it works. Call out behaviour changes and
  anything that changes what the client sends or receives.
- **This repository is public.** Nothing in it, including PR text,
  changelogs and release notes, links to or names Sent's private
  repositories, internal systems or the providers behind a channel. Write
  for the customer who installs the package. One exception the package
  cannot avoid: the web client bundles a provider's WebRTC SDK, so that
  provider's name is in `packages/voice-client/src/adapter/`, in the
  dependency it declares, and in the adapter notes under `docs/`. Keep it
  there and nowhere else: never in a public type or option name, the
  README, a changelog or a release note.
