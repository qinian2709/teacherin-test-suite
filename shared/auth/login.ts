import { accounts, env } from '../../config/index.js';
import { Endpoints } from '../api/endpoints.js';
import { browserHeaders } from '../http/browser-headers.js';
import { createLogger } from '../utils/logger.js';

const log = createLogger('auth');

let resolvePromise: Promise<void> | null = null;

function envHas(key: string): boolean {
  return Boolean((process.env[key] ?? '').trim());
}

function cookiesFromResponse(res: Response): string {
  const getter = res.headers.getSetCookie?.bind(res.headers);
  const list = getter ? getter() : [];
  if (list.length === 0) {
    const raw = res.headers.get('set-cookie');
    return raw ? raw.split(',')[0]!.split(';')[0]! : '';
  }
  return list
    .map((item) => item.split(';')[0] ?? '')
    .filter(Boolean)
    .join('; ');
}

/**
 * 框架鉴权：POST /user/loginbywhiteuser 只为拿 session cookie。
 * 不是用例步骤，spec 里不要再打这个接口。
 */
async function loginByWhiteUserForCookie(): Promise<void> {
  if (!accounts.phone) return;

  const res = await fetch(`${env.apiBaseURL}${Endpoints.user.loginByWhiteUser}`, {
    method: 'POST',
    headers: {
      ...browserHeaders(),
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      phone_number: accounts.phone,
      nation_code: accounts.nationCode,
    }),
  });

  if (!res.ok) {
    throw new Error(`白名单登录失败 HTTP ${res.status}（${env.apiBaseURL}${Endpoints.user.loginByWhiteUser}）`);
  }

  const cookie = cookiesFromResponse(res);
  if (!cookie) {
    throw new Error('白名单登录未下发 Set-Cookie，后续接口无法带会话');
  }
  accounts.sessionCookie = cookie;
  log.info(`框架已用 TEST_ACCOUNT 换到 session cookie`);
}

/**
 * Worker 启动时解析鉴权。
 * 有 TEST_ACCOUNT 就换 cookie；API_TOKEN 仅作可选补充。
 */
export async function loginWhiteUserSession(
  phone: string,
  nationCode = '86',
): Promise<string> {
  const res = await fetch(`${env.apiBaseURL}${Endpoints.user.loginByWhiteUser}`, {
    method: 'POST',
    headers: {
      ...browserHeaders(),
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      phone_number: phone,
      nation_code: nationCode,
    }),
  });

  if (!res.ok) {
    throw new Error(`白名单登录失败 HTTP ${res.status} phone=${phone}`);
  }

  const cookie = cookiesFromResponse(res);
  if (!cookie) {
    throw new Error(`白名单登录未下发 cookie phone=${phone}`);
  }
  return cookie;
}

export async function resolveAuthTokens(forceRefresh = false): Promise<void> {
  if (forceRefresh) resolvePromise = null;
  if (resolvePromise) {
    await resolvePromise;
    return;
  }

  resolvePromise = (async () => {
    if (accounts.phone) {
      await loginByWhiteUserForCookie();
    } else if (accounts.token) {
      log.info('主站：未配 TEST_ACCOUNT，使用 API_TOKEN / TEST_TOKEN');
    } else {
      log.warn('主站：未配置 TEST_ACCOUNT / API_TOKEN，需登录用例将 skip');
    }

    if (envHas('ADMIN_API_TOKEN')) {
      log.info('管理后台：使用 ADMIN_API_TOKEN');
    } else if (accounts.adminToken) {
      log.info('管理后台：回落主站 token');
    }

    if (!envHas('MINIPROGRAM_TEST_TOKEN') && accounts.token) {
      accounts.miniprogramToken = accounts.token;
    }
  })();

  await resolvePromise;
}

export async function getAccessToken(forceRefresh = false): Promise<string> {
  await resolveAuthTokens(forceRefresh);
  if (accounts.token) return accounts.token;
  throw new Error('未配置 API_TOKEN / TEST_TOKEN（白名单登录只下发 cookie，不保证有 token）');
}

export async function getAdminAccessToken(forceRefresh = false): Promise<string> {
  await resolveAuthTokens(forceRefresh);
  if (accounts.adminToken) return accounts.adminToken;
  throw new Error('未配置管理后台鉴权凭据：请设置 ADMIN_API_TOKEN 或 API_TOKEN');
}

export function resetTokenCache(): void {
  resolvePromise = null;
}
