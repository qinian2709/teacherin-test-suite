import { Endpoints } from '../api/endpoints.js';
import type { ApiHelper } from '../fixtures/api-helper.js';
import { INFRA_API_OPTS } from './infra.js';
import { isEnvelope, SUCCESS_CODE } from '../http/types.js';

/** POST /orgs/{orgid}/admin/distribution/add */
export function buildAddDistributionGoodsPayload(
  repoId: string,
  commissionRate = 10,
): Record<string, unknown> {
  return {
    list: [
      {
        repoID: Number(repoId),
        distributionCond: 0,
        commissionRate,
        posterBackground: '',
        posterType: 0,
        posterInfo: '',
      },
    ],
  };
}

/** 将已发布付费课加入推广商品（spread/info 前置） */
export async function ensureRepoInDistribution(
  api: ApiHelper,
  orgId: string,
  repoId: string,
  commissionRate = 10,
): Promise<void> {
  const path = Endpoints.org.adminDistributionAdd(orgId);
  const result = await api.post(
    path,
    buildAddDistributionGoodsPayload(repoId, commissionRate),
    INFRA_API_OPTS,
  );
  if (!result.ok) {
    throw new Error(
      `加入推广商品失败 POST ${path} HTTP ${result.status} body=${JSON.stringify(result.body)}`,
    );
  }
  if (isEnvelope(result.body) && result.body.code !== SUCCESS_CODE) {
    throw new Error(`加入推广商品失败 code=${result.body.code} msg=${result.body.msg}`);
  }
}
