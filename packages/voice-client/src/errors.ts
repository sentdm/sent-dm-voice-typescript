// The error family lives in @sentdm/voice-client-core; this keeps @sentdm/voice-client/errors as its public
// entry point.
export {
  SentVoiceError,
  TokenExpiredError,
  TokenInvalidError,
  NotRegisteredError,
  MediaPermissionError,
  CallRejectedError,
  CallFailedError,
  NetworkError,
  CapabilityUnsupportedError,
  type SentVoiceErrorCode,
  type SentVoiceErrorCategory,
} from '@sentdm/voice-client-core';
