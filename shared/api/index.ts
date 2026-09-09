import { accounts, env } from '../../config/index.js';
import { request } from '../http/client.js';
import { Endpoints } from './endpoints.js';

/**
 * 领域 API 封装：只映射 teacherin-go-git 的 routers/api/v1。
 * 主站 www* → go-git；path 必须能在 go-git 路由/swagger 里对上。
 */
export const api = {
  user: {
    current: () => request(Endpoints.user.current),
  },
  repo: {
    search: () => request(Endpoints.repo.search),
  },
  swagger: {
    get: () => request(Endpoints.swagger),
  },
};

export const adminApi = {
  swagger: {
    get: () =>
      request(Endpoints.admin.swagger, {
        baseURL: env.adminApiBaseURL,
        token: accounts.adminToken,
      }),
  },
  misc: {
    ping: () =>
      request(Endpoints.admin.miscVersion, {
        baseURL: env.adminApiBaseURL,
        token: accounts.adminToken,
      }),
  },
};

export { Endpoints } from './endpoints.js';
export { attachApiCallLog } from './report.js';
export {
  loggedGet,
  loggedPost,
  loggedRaw,
  buildApiRequestUrl,
  MAX_API_RESPONSE_MS,
} from './logged-call.js';
export type { ApiCallLogOptions } from './report.js';
export type { ApiLogOptions } from './logged-call.js';
export type { UserInfo } from './types.js';
