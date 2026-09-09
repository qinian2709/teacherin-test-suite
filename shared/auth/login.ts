import { accounts } from '../../config/index.js';
import { createLogger } from '../utils/logger.js';

const log = createLogger('auth');

let resolvePromise: Promise<void> | null = null;

function envHas(key: string): boolean {
  return Boolean((process.env[key] ?? '').trim());
}

/**
 * 解析主站与管理后台 token（当前以环境变量注入为主）。
 * - 主站：API_TOKEN / TEST_TOKEN
 * - 管理后台：ADMIN_API_TOKEN，缺省回落主站 token
 * - 小程序：MINIPROGRAM_TEST_TOKEN，缺省回落主站 token
 */
export async function resolveAuthTokens(forceRefresh = false): Promise<void> {
  if (forceRefresh) resolvePromise = null;
  if (resolvePromise) {
    await resolvePromise;
    return;
  }

  resolvePromise = (async () => {
    if (accounts.token) {
      log.info('主站：使用 API_TOKEN / TEST_TOKEN');
    } else {
      log.warn('主站：未配置 API_TOKEN / TEST_TOKEN，需登录用例将 skip');
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
  throw new Error('未配置主站鉴权凭据：请设置 API_TOKEN 或 TEST_TOKEN');
}

export async function getAdminAccessToken(forceRefresh = false): Promise<string> {
  await resolveAuthTokens(forceRefresh);
  if (accounts.adminToken) return accounts.adminToken;
  throw new Error('未配置管理后台鉴权凭据：请设置 ADMIN_API_TOKEN 或 API_TOKEN');
}

export function resetTokenCache(): void {
  resolvePromise = null;
}
