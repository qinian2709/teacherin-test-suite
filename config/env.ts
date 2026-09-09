import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

export type EnvName = '13' | '14' | '15' | 'im' | 'im2' | 'production';

const ENV_NAMES: EnvName[] = ['13', '14', '15', 'im', 'im2', 'production'];

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function loadEnvFile(file: string): void {
  const full = path.join(ROOT, file);
  if (fs.existsSync(full)) {
    const parsed = dotenv.parse(fs.readFileSync(full));
    for (const [key, value] of Object.entries(parsed)) {
      if (!(process.env[key] ?? '').trim()) {
        process.env[key] = value;
      }
    }
  }
}

// 先加载 .env.local（含真实凭据，可选地设置 TEST_ENV），再据此决定环境域名文件。
loadEnvFile('.env.local');

function parseEnvName(raw: string): EnvName {
  const value = raw.trim();
  if ((ENV_NAMES as string[]).includes(value)) return value as EnvName;
  throw new Error(`非法 TEST_ENV=${raw}，仅支持 ${ENV_NAMES.join(' | ')}`);
}

/** 被测环境，默认 13。可用 TEST_ENV=14，或兼容旧变量 ENV=14。 */
export const TEST_ENV: EnvName = parseEnvName(process.env.TEST_ENV ?? process.env.ENV ?? '13');

loadEnvFile(`.env.${TEST_ENV}`);
loadEnvFile('.env');

function get(key: string, fallback = ''): string {
  return (process.env[key] ?? fallback).trim();
}

function getBoolean(key: string): boolean {
  return ['1', 'true', 'yes', 'on'].includes(get(key).toLowerCase());
}

const MAIN_HOST: Record<EnvName, string> = {
  '13': 'www13.teacherin.vip',
  '14': 'www14.teacherin.vip',
  '15': 'www15.teacherin.vip',
  im: 'www.teacherin.vip',
  im2: 'www2.teacherin.vip',
  production: 'www.teacherin.cn',
};

const ADMIN_HOST: Record<EnvName, string> = {
  '13': 'zxjs13.teacherin.vip',
  '14': 'zxjs14.teacherin.vip',
  '15': 'zxjs15.teacherin.vip',
  im: 'zxjs.teacherin.vip',
  im2: 'zxjs2.teacherin.vip',
  production: 'zxjs.teacherin.cn',
};

export interface EnvConfig {
  name: EnvName;
  /** 主站 / 移动端域名（www*） */
  webHost: string;
  /** 管理后台域名（zxjs*） */
  adminHost: string;
  /** 主站 API 基础路径，如 https://www13.teacherin.vip/api/v1 */
  apiBaseURL: string;
  /** 管理后台 API 基础路径 */
  adminApiBaseURL: string;
  /** PC 主站 E2E 基础地址 */
  webBaseURL: string;
  /** 管理后台 E2E 基础地址 */
  adminBaseURL: string;
  /** 移动端 H5 E2E 基础地址（默认与主站相同） */
  mobileBaseURL: string;
  /** E2E 关键步骤截图开关 */
  e2eStepScreenshots: boolean;
}

const webHost = get('WEB_HOST', get('BASE_URL', `https://${MAIN_HOST[TEST_ENV]}`)).replace(
  /\/$/,
  '',
);
const adminHost = get(
  'ADMIN_HOST',
  get('ADMIN_BASE_URL', `https://${ADMIN_HOST[TEST_ENV]}`),
).replace(/\/$/, '');

export const env: EnvConfig = {
  name: TEST_ENV,
  webHost,
  adminHost,
  apiBaseURL: get('API_BASE_URL', `${webHost}/api/v1`).replace(/\/$/, ''),
  adminApiBaseURL: get('ADMIN_API_BASE_URL', `${adminHost}/api/v1`).replace(/\/$/, ''),
  webBaseURL: get('WEB_BASE_URL', webHost),
  adminBaseURL: get('ADMIN_BASE_URL', adminHost),
  mobileBaseURL: get('MOBILE_BASE_URL', webHost),
  e2eStepScreenshots: getBoolean('E2E_STEP_SCREENSHOTS'),
};

/** 兼容旧调用 `loadEnv()`。 */
export function loadEnv(): EnvConfig {
  return env;
}
