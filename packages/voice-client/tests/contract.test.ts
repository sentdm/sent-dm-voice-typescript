import path from 'node:path';
import ts from 'typescript';
import * as core from '@sentdm/voice-client-core';
import { Call, type CallEvents, type CallState } from '@sentdm/voice-client/call';
import contract from '../../../contract/voice-client.json';

// The web packages are checked against contract/voice-client.json, the contract every Voice Client SDK
// shares. Type-level facts are read with the TypeScript compiler, the rest by running the code.

const root = path.resolve(__dirname, '..', '..', '..');
const files = {
  errors: 'packages/voice-client-core/src/errors.ts',
  telemetry: 'packages/voice-client-core/src/telemetry.ts',
  call: 'packages/voice-client/src/call.ts',
  client: 'packages/voice-client/src/client.ts',
  invite: 'packages/voice-client/src/invite.ts',
  audio: 'packages/voice-client/src/audio.ts',
};

const { config } = ts.readConfigFile(path.join(root, 'tsconfig.json'), ts.sys.readFile);
const { options } = ts.parseJsonConfigFileContent(config, ts.sys, root);
const program = ts.createProgram(
  Object.values(files).map((file) => path.join(root, file)),
  options,
);
const checker = program.getTypeChecker();

const typeOf = (file: string, name: string): ts.Type => {
  let found: ts.TypeAliasDeclaration | ts.InterfaceDeclaration | undefined;
  const visit = (node: ts.Node) => {
    if ((ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) && node.name.text === name) {
      found = node;
    } else {
      ts.forEachChild(node, visit);
    }
  };
  visit(program.getSourceFile(path.join(root, file))!);
  if (!found) throw new Error(`${name} is not declared in ${file}`);
  return checker.getTypeAtLocation(found.name);
};

/** The members of a union of string literals. */
const literals = (file: string, name: string): string[] => {
  const type = typeOf(file, name);
  return (type.isUnion() ? type.types : [type])
    .map((member) => (member as ts.StringLiteralType).value)
    .sort();
};

/** The property names of an object type, such as an event map. */
const keys = (file: string, name: string): string[] =>
  typeOf(file, name)
    .getProperties()
    .map((property) => property.name)
    .sort();

const sorted = (values: readonly string[]) => [...values].sort();

describe('the Voice Client contract', () => {
  test('has a semver version', () => {
    expect(contract.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  test('error codes and categories match the error family', () => {
    expect(literals(files.errors, 'SentVoiceErrorCode')).toEqual(sorted(contract.errors.codes));
    expect(literals(files.errors, 'SentVoiceErrorCategory')).toEqual(sorted(contract.errors.categories));
  });

  test('each error class carries the code, category and retriable flag the contract gives it', () => {
    const classes = Object.entries(core as Record<string, unknown>)
      .filter(
        (entry): entry is [string, new () => core.SentVoiceError] =>
          typeof entry[1] === 'function' && entry[1].prototype instanceof core.SentVoiceError,
      )
      .map(([name, ErrorClass]) => {
        const { code, category, retriable } = new ErrorClass();
        return { name, code, category, retriable };
      });

    const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);
    expect(classes.sort(byName)).toEqual([...contract.errors.classes].sort(byName));
  });

  test('client states and events match the client', () => {
    expect(literals(files.client, 'ClientState')).toEqual(sorted(contract.client.states));
    expect(keys(files.client, 'SentVoiceEvents')).toEqual(sorted(contract.client.events));
  });

  test('call, invite and audio events match their emitters', () => {
    expect(keys(files.call, 'CallEvents')).toEqual(sorted(contract.call.events));
    expect(keys(files.invite, 'CallInviteEvents')).toEqual(sorted(contract.invite.events));
    expect(keys(files.audio, 'AudioControllerEvents')).toEqual(sorted(contract.audio.events));
  });

  test('call states match the call', () => {
    expect(literals(files.call, 'CallState')).toEqual(sorted(contract.call.states));
  });

  test('a call starts in the state the contract gives its direction', () => {
    for (const direction of ['outbound', 'inbound'] as const) {
      expect(newCall(direction).call.state).toBe(contract.call.initialState[direction]);
    }
  });

  test('a call accepts exactly the transitions the contract allows', () => {
    const states = contract.call.states as CallState[];
    const targets = states.filter((state): state is Exclude<CallState, 'initiated'> => state !== 'initiated');
    const actual = Object.fromEntries(
      states.map((from) => [from, targets.filter((to) => accepts(from, to))]),
    );
    const allowed = Object.fromEntries(
      states.map((from) => [
        from,
        sorted((contract.call.transitions as Record<string, string[]>)[from] ?? []),
      ]),
    );

    expect(Object.fromEntries(Object.entries(actual).map(([from, to]) => [from, sorted(to)]))).toEqual(
      allowed,
    );
  });

  test('token timing matches the token lifecycle', () => {
    expect(core.tokenTiming).toEqual(contract.token);
  });

  test('telemetry events and payload fields match what the client reports', () => {
    expect(literals(files.telemetry, 'EventType')).toEqual(sorted(contract.telemetry.events));
    expect(keys(files.telemetry, 'Payload')).toEqual(sorted(contract.telemetry.payloadFields));
  });
});

type Update = (state: Exclude<CallState, 'initiated'>) => void;

const newCall = (direction: 'inbound' | 'outbound') => {
  let update: Update = () => {
    throw new Error('the call did not subscribe to updates');
  };
  const call = new Call(
    'call_contract',
    direction,
    { kind: 'user', identity: 'agent-42' },
    { kind: 'number', number: '+14155550100' },
    {
      hangup: async () => {},
      mute: () => {},
      sendDigits: () => {},
      getStats: async () => ({ jitter: 0, packetLoss: 0, rtt: 0 }),
      onUpdate: (listener) => {
        update = listener;
      },
      onQualityWarning: () => {},
    },
  );
  return { call, update: (state: Exclude<CallState, 'initiated'>) => update(state) };
};

// How the test brings a fresh call into each state, through updates the call accepts.
const routes: Record<
  CallState,
  { direction: 'inbound' | 'outbound'; path: Exclude<CallState, 'initiated'>[] }
> = {
  initiated: { direction: 'outbound', path: [] },
  ringing: { direction: 'inbound', path: [] },
  answered: { direction: 'outbound', path: ['answered'] },
  connected: { direction: 'outbound', path: ['connected'] },
  reconnecting: { direction: 'outbound', path: ['connected', 'reconnecting'] },
  completed: { direction: 'outbound', path: ['completed'] },
  failed: { direction: 'outbound', path: ['failed'] },
  busy: { direction: 'outbound', path: ['busy'] },
  noAnswer: { direction: 'outbound', path: ['noAnswer'] },
};

const callEvents: (keyof CallEvents)[] = [
  'ringing',
  'answered',
  'connected',
  'reconnecting',
  'reconnected',
  'disconnected',
];

// A transition is accepted when the call reacts to the update with an event. The state alone can't tell,
// because a repeated update leaves it unchanged whether it was taken or ignored.
const accepts = (from: CallState, to: Exclude<CallState, 'initiated'>): boolean => {
  const { direction, path } = routes[from];
  const { call, update } = newCall(direction);
  for (const state of path) update(state);
  if (call.state !== from) throw new Error(`could not bring a call to ${from}`);

  let reacted = false;
  for (const event of callEvents) call.on(event, () => (reacted = true));
  update(to);
  return reacted;
};
