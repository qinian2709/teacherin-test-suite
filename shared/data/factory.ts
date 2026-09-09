import { randomPhone, uniqueName, randomString, randomEmail } from '../utils/random.js';

export interface SignupPayload {
  phone: string;
  password: string;
  nickname?: string;
  email?: string;
  [key: string]: unknown;
}

export function buildSignupPayload(overrides: Partial<SignupPayload> = {}): SignupPayload {
  return {
    phone: randomPhone(),
    password: `Test@${randomString(6)}`,
    nickname: uniqueName('user'),
    email: randomEmail(),
    ...overrides,
  };
}
