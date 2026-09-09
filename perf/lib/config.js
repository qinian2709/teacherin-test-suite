// k6 运行时配置（k6 使用自带 JS 运行时，非 Node，故独立于 shared/）。
// 通过环境变量注入：K6_ENV(13|14|im)、TOKEN。

const HOSTS = {
  13: 'https://www13.teacherin.vip',
  14: 'https://www14.teacherin.vip',
  15: 'https://www15.teacherin.vip',
  im: 'https://www.teacherin.vip',
  im2: 'https://www2.teacherin.vip',
  production: 'https://www.teacherin.cn',
};

const envName = __ENV.K6_ENV || '13';
const apiHost = __ENV.API_HOST || __ENV.BASE_URL || HOSTS[envName] || HOSTS['13'];

export const config = {
  envName,
  apiHost,
  baseURL: `${String(apiHost).replace(/\/$/, '')}/api/v1`,
  token: __ENV.TOKEN || __ENV.API_TOKEN || '',
};

export function headers() {
  const h = { 'Content-Type': 'application/json' };
  if (config.token) h.Authorization = `Bearer ${config.token}`;
  return h;
}
