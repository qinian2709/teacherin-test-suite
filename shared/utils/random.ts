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

/** 本地标准时间 YYYY-MM-DD HH:mm:ss，用于测试数据命名（替代 Date.now 毫秒时间戳）。 */
export function formatStandardTime(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/** 带前缀的唯一名称，后缀为标准时间。prefix 为空时仅返回标准时间。 */
export function uniqueName(prefix = 'autotest'): string {
  const time = formatStandardTime();
  if (!prefix) return time;
  return `${prefix}${time}`;
}

/** 文件 tree_path / full_path 专用：仍用毫秒戳+随机后缀（路径禁止 `:`，不适用标准时间）。 */
export function uniqueFilePath(prefix = 'file'): string {
  return `${prefix}-${Date.now()}-${randomString(4)}`;
}

export function randomEmail(domain = 'autotest.local'): string {
  return `${uniqueName('u')}@${domain}`;
}
