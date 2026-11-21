import { CallClientInstance } from 'sinch-rtc/npm/src/calling/CallClientInstance';
import { DefaultCallClient } from 'sinch-rtc/npm/src/calling/DefaultCallClient';

/**
 * With `incomingCalls.endDialingCall`, the adapter wraps the invite handler of the provider's library and
 * reads two things the handler itself reads. None of it is part of the library's typed surface, so it is
 * checked here against the pinned library: an upgrade that moves any of it fails this test, where the
 * adapter would only go back to never ending a dialing call.
 */
describe('the parts of sinch-rtc the adapter reaches into', () => {
  const instance = CallClientInstance.prototype as unknown as Record<string, unknown>;

  test('the call client hands out its instance, which has the invite handler', () => {
    expect(typeof (DefaultCallClient.prototype as unknown as Record<string, unknown>)['getInstance']).toBe(
      'function',
    );
    expect(typeof instance['onInvite']).toBe('function');
  });

  test('the invite handler is called through the instance, so a wrapped one is the one that runs', () => {
    expect(String(CallClientInstance)).toContain('this.onInvite(');
  });

  test('the handler ignores an invite for another instance, then ends one that finds a call in progress', () => {
    const source = String(instance['onInvite']);
    const addressed = source.indexOf('message.isAddressedToInstance(this.instanceId)');
    const asked = source.indexOf('this.hasActiveCall()');

    expect(addressed).toBeGreaterThan(-1);
    expect(asked).toBeGreaterThan(addressed);
    expect(source).toContain('terminateDueToOngoingCall');
    expect(String(CallClientInstance)).toContain('this.instanceId = instanceId');
  });

  test('ending any call cancels the one signaling subscription, which is why two calls never coexist', () => {
    expect(String(CallClientInstance)).toMatch(/onCallEnded:[\s\S]{0,400}this\.cancelSubscription\(\)/);
  });
});
