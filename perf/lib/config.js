// k6 脚本公共配置：目标环境 + token。
export const BASE_URL = __ENV.BASE_URL || 'https://www13.teacherin.vip';
export const API_BASE_URL = `${BASE_URL}/api/v1`;
export const API_TOKEN = __ENV.API_TOKEN || '';
