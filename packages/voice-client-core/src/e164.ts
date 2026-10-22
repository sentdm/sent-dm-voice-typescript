const e164 = /^\+[1-9]\d{1,14}$/;

/** True for a phone number in E.164 format, like `+14155551234`. */
export const isE164 = (value: string): boolean => e164.test(value);
