// The shared core of the Sent Voice Client packages: errors, the typed emitter, logging, the voice token
// lifecycle, telemetry and E.164 validation. Its surface is internal to those packages and may change in
// any release; apps use @sentdm/voice-client.
export * from './errors';
export { attachProviderDetail, providerDetailOf } from './provider-detail';
export { TypedEmitter } from './events';
export { createLog, parseLogLevel, type Log, type Logger, type LogLevel } from './log';
export {
  decodeToken,
  fetchToken,
  offlineRetryDelay,
  qualify,
  readClaims,
  refreshDelay,
  retryDelay,
  unqualify,
  type VoiceToken,
} from './token';
export { Telemetry, type CallStats, type TelemetryCall } from './telemetry';
export { isE164 } from './e164';
