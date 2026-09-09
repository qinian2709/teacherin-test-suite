import { env, formatAuthorizationHeader } from '../../config/index.js';

const DEFAULT_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36';

export function browserHeaders(origin = env.webBaseURL): Record<string, string> {
  const normalized = origin.replace(/\/$/, '');
  return {
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'User-Agent': process.env.TEST_USER_AGENT || DEFAULT_UA,
    ...(normalized ? { Origin: normalized, Referer: `${normalized}/` } : {}),
  };
}

export function authHeader(token: string): Record<string, string> {
  return token ? { Authorization: formatAuthorizationHeader(token) } : {};
}
