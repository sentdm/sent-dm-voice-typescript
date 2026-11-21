import { CallClientInstance } from 'sinch-rtc/npm/src/calling/CallClientInstance';
import { DefaultCallClient } from 'sinch-rtc/npm/src/calling/DefaultCallClient';

/**
 * The adapter lets an invite through during another call by reaching two members of the provider's library
 * that are not part of its typed surface. They are checked here against the pinned library itself, so an
 * upgrade that moves them fails this test, where the adapter would only go back to dropping such calls.
 */
describe('the parts of sinch-rtc the adapter reaches into', () => {
  const instance = CallClientInstance.prototype as unknown as Record<string, unknown>;

  test('the call client hands out its instance, which has the invite handler and the question it asks', () => {
    expect(typeof (DefaultCallClient.prototype as unknown as Record<string, unknown>)['getInstance']).toBe(
      'function',
    );
    expect(typeof instance['onInvite']).toBe('function');
    expect(typeof instance['hasActiveCall']).toBe('function');
  });

  test('the invite handler asks whether a call is in progress before it first waits', () => {
    const source = String(instance['onInvite']);
    const asked = source.indexOf('this.hasActiveCall()');

    expect(asked).toBeGreaterThan(-1);
    expect(source.slice(0, asked)).not.toMatch(/\byield\b|\bawait\b/);
    expect(source).toContain('terminateDueToOngoingCall');
  });
});
