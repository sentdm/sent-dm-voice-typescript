import SentVoice, { SentVoiceError } from '@sentdm/voice-client';

// Set from SENT_API_BASE_URL by vite.config.ts: the API the SDK exchanges tokens with.
declare const __SENT_API_BASE_URL__: string;

type Call = SentVoice.Call;

const element = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const input = (id: string) => element<HTMLInputElement>(id);

function log(message: string) {
  const line = document.createElement('li');
  line.textContent = `${new Date().toLocaleTimeString()}  ${message}`;
  element('log').prepend(line);
}

const describe = (error: unknown) =>
  error instanceof SentVoiceError ? `${error.code}: ${error.message}`
  : error instanceof Error ? error.message
  : String(error);

const addressOf = (address: SentVoice.Address) =>
  address.kind === 'user' ? address.identity
  : address.kind === 'number' ? address.number
  : `room ${address.name}`;

let client: SentVoice | undefined;
let invite: SentVoice.CallInvite | undefined;

// Shows the controls that fit what is happening: going online, a call ringing in, or a call in progress.
function render() {
  const call = client?.activeCall ?? null;
  const ringing = invite?.state === 'pending';
  element('status').textContent =
    client ? [client.identity, client.state].filter(Boolean).join(': ') : 'Offline';
  element('incoming').hidden = !ringing;
  element('call').hidden = !call;
  element('dialer').hidden = !client || Boolean(call);
  if (ringing) element('incoming-from').textContent = addressOf(invite!.from);
  if (call) {
    element('call-with').textContent = addressOf(call.direction === 'inbound' ? call.from : call.to);
    element('call-state').textContent = call.state;
    element('mute').textContent = call.isMuted ? 'Unmute' : 'Mute';
  }
}

function follow(call: Call) {
  for (const event of ['ringing', 'answered', 'connected', 'reconnecting', 'reconnected'] as const) {
    call.on(event, () => {
      log(`call ${event}`);
      render();
    });
  }
  call.on('disconnected', ({ state, error }) => {
    log(`call ended as ${state}${error ? ` (${describe(error)})` : ''}`);
    render();
  });
  call.on('muteChanged', (isMuted) => {
    log(isMuted ? 'muted' : 'unmuted');
    render();
  });
  call.on('qualityWarning', ({ metric, cleared }) =>
    log(`call quality: ${metric} ${cleared ? 'recovered' : 'poor'}`),
  );
  call.on('error', (error) => log(`call error: ${describe(error)}`));
  render();
}

element('go-online').addEventListener('click', async () => {
  const name = input('identity').value.trim();
  if (!name) return log('Enter an identity first');
  client?.destroy();
  client = new SentVoice({
    baseURL: __SENT_API_BASE_URL__,
    logLevel: 'info',
    tokenProvider: async () => {
      const response = await fetch(`/api/voice-token?identity=${encodeURIComponent(name)}`);
      const body = await response.text();
      if (!response.ok) throw new Error(`Minting a voice token failed with ${response.status}: ${body}`);
      return body;
    },
  });

  for (const event of ['registering', 'registered', 'unregistered'] as const) {
    client.on(event, () => {
      log(event);
      render();
    });
  }
  client.on('tokenWillExpire', ({ expiresAt }) =>
    log(`token expires at ${new Date(expiresAt).toLocaleTimeString()}, refreshing`),
  );
  client.on('offline', (reason) => {
    log(`offline: ${describe(reason)}`);
    render();
  });
  client.on('error', (error) => log(`error: ${describe(error)}`));
  client.on('activeCallChanged', render);
  client.on('incomingCall', (incoming) => {
    log(`incoming call from ${addressOf(incoming.from)}`);
    invite = incoming;
    incoming.on('cancelled', () => {
      log('the caller hung up');
      render();
    });
    render();
  });

  try {
    await client.register();
  } catch (error) {
    log(`register failed: ${describe(error)}`);
  }
});

element('dialer').addEventListener('submit', async (event) => {
  event.preventDefault();
  const to = input('to').value.trim();
  try {
    follow(await client!.connect({ to }));
    log(`calling ${to}`);
  } catch (error) {
    log(`call failed: ${describe(error)}`);
  }
});

element('accept').addEventListener('click', async () => {
  try {
    follow(await invite!.accept());
  } catch (error) {
    log(`answer failed: ${describe(error)}`);
  }
});

element('decline').addEventListener('click', async () => {
  await invite?.reject();
  render();
});

element('hangup').addEventListener('click', () => void client?.activeCall?.hangup());
element('mute').addEventListener('click', () => client?.activeCall?.mute());
element('digits').addEventListener('submit', (event) => {
  event.preventDefault();
  const digits = input('digit').value;
  client?.activeCall?.sendDigits(digits);
  log(`sent digits ${digits}`);
  input('digit').value = '';
});

element('api').textContent = __SENT_API_BASE_URL__;
render();
