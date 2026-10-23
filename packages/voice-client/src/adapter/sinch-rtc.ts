// The calling provider's library, loaded when a client first registers; the build bundles it in here
// (scripts/bundle.mjs). Only the values the adapter reads at runtime: its types come from sinch-rtc.
export { CallEndCause, CallQualityWarningEventType, ErrorType, Sinch } from 'sinch-rtc';
