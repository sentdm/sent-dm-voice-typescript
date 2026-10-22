# @sentdm/voice-client-react

React bindings for [`@sentdm/voice-client`](https://www.npmjs.com/package/@sentdm/voice-client), the Sent Voice Client for the web.

## Installation

```sh
npm install @sentdm/voice-client @sentdm/voice-client-react
```

## Usage

`@sentdm/voice-client-react` wraps one client in a provider, with hooks that re-render on its events. It supports React 18 and 19.

```tsx
import { SentVoiceProvider, useActiveCall, useIncomingCall, useSentVoice } from '@sentdm/voice-client-react';

const getVoiceToken = () => fetch('/api/voice-token').then((response) => response.text());

export function App() {
  return (
    <SentVoiceProvider tokenProvider={getVoiceToken} autoRegister={false}>
      <Phone />
    </SentVoiceProvider>
  );
}

function Phone() {
  const { client, state, register } = useSentVoice();
  const invite = useIncomingCall();
  const { call, state: callState, isMuted, mute, hangup, duration } = useActiveCall();

  if (state !== 'registered') return <button onClick={register}>Go online</button>;
  if (invite) {
    return (
      <p>
        <button onClick={() => invite.accept()}>Answer</button>
        <button onClick={() => invite.reject()}>Decline</button>
      </p>
    );
  }
  if (call) {
    return (
      <p>
        {callState} for {duration} s <button onClick={() => mute()}>{isMuted ? 'Unmute' : 'Mute'}</button>
        <button onClick={hangup}>Hang up</button>
      </p>
    );
  }
  return <button onClick={() => client?.connect({ to: 'ben' })}>Call Ben</button>;
}
```

- `SentVoiceProvider` takes every client option, plus `autoRegister` (default `true`), which registers as soon as the client exists. Registering needs the notification permission, which Firefox and Safari only ask for after a user gesture, so the example registers from a click.
- The client is created after the provider mounts, so its children render first, on the server too, with `client` `null` and `state` `'unregistered'`. Unmounting destroys the client and ends its calls.
- Props are read once, when the client is created: remount the provider with a new `key` to change them, for example for another user. `tokenProvider` is the exception, the latest one is always used.
- `useSentVoice()` gives the client, its state, `register` and `unregister`. `useIncomingCall()` gives the newest invite still waiting for an answer, or `null`. `useActiveCall()` gives the active call with its state, `isMuted`, `mute`, `hangup`, `sendDigits` and `duration`, the seconds since it connected. `useAudioDevices()` gives the microphones and speakers with `setInput` and `setOutput`.
- The entry point is marked `'use client'` for the Next.js App Router.
