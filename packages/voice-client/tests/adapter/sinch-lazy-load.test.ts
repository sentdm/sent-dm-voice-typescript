import SentVoice from '@sentdm/voice-client';
import { voiceToken } from '../../../voice-client-core/tests/voice-token';

const mockLoaded = jest.fn();

jest.mock('sinch-rtc', () => {
  mockLoaded();
  return jest.requireActual('./sinch-rtc');
});

test('sinch-rtc loads on the first register, not when the SDK is imported or a client is created', async () => {
  const client = new SentVoice({
    tokenProvider: async () => voiceToken(),
    logLevel: 'off',
    telemetry: { disabled: true },
  });
  expect(mockLoaded).not.toHaveBeenCalled();

  await client.register();
  expect(mockLoaded).toHaveBeenCalledTimes(1);

  await client.destroy();
});
