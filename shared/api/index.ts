// 领域 API 封装：按后端 routers/api/v1 领域目录。
// go-git 主站领域（activity/article/catalog/community/order/org/user/merchant/shop/repo）；
// go-admin 管理后台领域（admin/misc/repo）。
import { loadEnv } from '../../config/env';
import { request } from '../http/client';

const env = loadEnv();

export const api = {
  user: {
    info: () => request('/user/info'),
  },
  repo: {
    list: () => request('/repo/search'),
  },
  swagger: {
    get: () => request('/swagger'),
  },
};

export const adminApi = {
  swagger: {
    get: () => request('/swagger', { baseURL: env.adminApiBaseURL }),
  },
  misc: {
    ping: () => request('/misc/version', { baseURL: env.adminApiBaseURL }),
  },
};
