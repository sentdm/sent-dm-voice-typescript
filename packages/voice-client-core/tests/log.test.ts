import { createLog } from '@sentdm/voice-client-core';
import { providerCredential, voiceToken } from './voice-token';

test('every message has voice tokens and the provider credentials they exchange for redacted', () => {
  const info = jest.fn();
  const log = createLog({ error: jest.fn(), warn: jest.fn(), info, debug: jest.fn() }, 'info');

  log.info(`token ${voiceToken()}, credential ${providerCredential()}.`);

  expect(info).toHaveBeenCalledWith('token ***, credential ***.');
});
