/** 测试账号与凭据集中管理。真实值通过 .env.local 注入，源码中不出现明文。 */
import './env.js';

function get(key: string, fallback = ''): string {
  return (process.env[key] ?? fallback).trim();
}

export interface Account {
  name: string;
  user: string;
  password: string;
}

export interface Accounts {
  /** 主站 / go-git accessToken（API_TOKEN 或 TEST_TOKEN）。 */
  token: string;
  /** 管理后台 / go-admin accessToken（ADMIN_API_TOKEN，缺省回落到主站 token）。 */
  adminToken: string;
  /** 小程序 UI 自动化 accessToken。 */
  miniprogramToken: string;
  /** E2E UI 登录账号（主站）。 */
  e2e: {
    username: string;
    password: string;
  };
  /** 管理后台 E2E 登录账号。 */
  adminE2e: {
    username: string;
    password: string;
  };
}

/** 运行时可被 resolveAuthTokens 回填 token，故使用可变对象。 */
export const accounts: Accounts = {
  token: get('API_TOKEN', get('TEST_TOKEN')),
  adminToken: get('ADMIN_API_TOKEN', get('API_TOKEN', get('TEST_TOKEN'))),
  miniprogramToken: get('MINIPROGRAM_TEST_TOKEN', get('API_TOKEN', get('TEST_TOKEN'))),
  e2e: {
    username: get('E2E_USERNAME', get('ACCOUNT_USER')),
    password: get('E2E_PASSWORD', get('ACCOUNT_PASSWORD')),
  },
  adminE2e: {
    username: get('ADMIN_E2E_USERNAME'),
    password: get('ADMIN_E2E_PASSWORD'),
  },
};

export function studentAccount(): Account {
  return {
    name: 'student',
    user: get('STUDENT_USER'),
    password: get('STUDENT_PASSWORD'),
  };
}

export function merchantAccount(): Account {
  return {
    name: 'merchant',
    user: get('MERCHANT_USER'),
    password: get('MERCHANT_PASSWORD'),
  };
}

export function hasApiCredential(): boolean {
  return Boolean(accounts.token);
}

export function hasAdminCredential(): boolean {
  return Boolean(accounts.adminToken);
}

export function formatAuthorizationHeader(token: string): string {
  return token.toLowerCase().startsWith('bearer ') ? token : `Bearer ${token}`;
}
