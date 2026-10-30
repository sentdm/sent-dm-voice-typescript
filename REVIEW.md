# Review instructions

Apply these to every pull request.

## Report these as Important, as well as functional bugs

- A violation of this repository's `CLAUDE.md`. Quote the rule.
- A new public name, parameter, option, event or error code that the PR
  description does not list.
- A change to `contract/voice-client.json` without the matching `version`
  bump, or a removed or renamed value without a major bump.
- A behaviour change with no test that fails before it and passes after.
- A fix made to one copy of logic that exists more than once: the web
  client and the React bindings, a method and its async twin, an event and
  the hook that re-renders on it.
- A commit subject that would read wrong in the changelog: an internal
  cause, a link customers can't open, or a type that cuts a release for a
  change customers don't see.
- A link to, or the name of, a private Sent repository, an internal system
  or a provider, anywhere in the diff.
- A comment that restates the code.

## Don't report these

- Formatting that `./scripts/format` would fix.
- Missing client-side validation of values the Sent API already validates.
