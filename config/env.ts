import 'dotenv/config';

export type EnvName = '13' | '14' | '15' | 'im' | 'im2' | 'production';

// 主站 / 移动端域名（www*）与管理后台域名（zxjs*）分属两套体系
const MAIN_HOST: Record<string, string> = {
  '13': 'www13.teacherin.vip',
  '14': 'www14.teacherin.vip',
  im: 'www.teacherin.vip',
  production: 'www.teacherin.cn',
};
const ADMIN_HOST: Record<string, string> = {
  '13': 'zxjs13.teacherin.vip',
  '14': 'zxjs14.teacherin.vip',
  '15': 'zxjs15.teacherin.vip',
  im: 'zxjs.teacherin.vip',
  im2: 'zxjs2.teacherin.vip',
  production: 'zxjs.teacherin.cn',
};

export interface EnvConfig {
  env: EnvName;
  baseURL: string;
  apiBaseURL: string;
  adminBaseURL: string;
  adminApiBaseURL: string;
  apiToken: string;
  account: { user: string; password: string };
  browserUse: Record<string, unknown>;
}

export function loadEnv(env?: string): EnvConfig {
  const target = env ?? process.env.ENV ?? '13';
  const mainHost = MAIN_HOST[target] ?? MAIN_HOST['13'];
  const adminHost = ADMIN_HOST[target] ?? ADMIN_HOST['13'];
  const baseURL = process.env.BASE_URL ?? `https://${mainHost}`;
  const adminBaseURL = process.env.ADMIN_BASE_URL ?? `https://${adminHost}`;

  return {
    env: target as EnvName,
    baseURL,
    apiBaseURL: process.env.API_BASE_URL ?? `${baseURL}/api/v1`,
    adminBaseURL,
    adminApiBaseURL: process.env.ADMIN_API_BASE_URL ?? `${adminBaseURL}/api/v1`,
    apiToken: process.env.API_TOKEN ?? '',
    account: {
      user: process.env.ACCOUNT_USER ?? '',
      password: process.env.ACCOUNT_PASSWORD ?? '',
    },
    browserUse: {},
  };
}
