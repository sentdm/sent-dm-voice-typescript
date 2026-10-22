import { exchange } from './voice-token';

// Every client registers through the token exchange. A test that fakes fetch for another route wraps its
// fake in `withExchange`; one that spies on fetch keeps the exchange behind the spy.
Object.defineProperty(globalThis, 'fetch', { configurable: true, writable: true, value: exchange });
