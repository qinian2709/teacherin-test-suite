import { randomBytes, randomInt } from 'node:crypto';

export function randomString(length = 8): string {
  return randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
}

export function randomPhone(): string {
  const prefixes = ['130', '131', '132', '150', '151', '152', '180', '181', '182'];
  const prefix = prefixes[randomInt(0, prefixes.length)]!;
  let tail = '';
  for (let i = 0; i < 8; i += 1) tail += randomInt(0, 10).toString();
  return `${prefix}${tail}`;
}

export function uniqueName(prefix = 'autotest'): string {
  return `${prefix}-${Date.now()}-${randomString(4)}`;
}

export function randomEmail(domain = 'autotest.local'): string {
  return `${uniqueName('u')}@${domain}`;
}
