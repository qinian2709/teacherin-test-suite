import { Endpoints } from '../api/endpoints.js';
import type { ApiHelper } from '../fixtures/api-helper.js';
import { INFRA_API_OPTS } from './infra.js';

/** 从 GET /orgs/{merchantOrgId} 响应解析 merchant 表主键（MS personalMerchatId）。 */
export function pickMerchantEntityId(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const root = body as Record<string, unknown>;
  const data =
    root.data && typeof root.data === 'object' ? (root.data as Record<string, unknown>) : root;
  for (const key of ['merchant_id', 'merchantId']) {
    const value = data[key];
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) return String(value);
    if (typeof value === 'string' && /^\d+$/.test(value) && value !== '0') return value;
  }
  return undefined;
}

/** TEST_MERCHANT_ID 是商家组织 orgid；/merchant/{id} 需 merchant 表 id。 */
export async function resolveMerchantEntityId(
  api: ApiHelper,
  merchantOrgId: string,
): Promise<string> {
  const result = await api.get(Endpoints.org.one(merchantOrgId), INFRA_API_OPTS);
  const entityId = pickMerchantEntityId(result.body);
  if (!entityId) {
    throw new Error(
      `商家组织 ${merchantOrgId} 响应无 merchant_id，无法调用 /merchant/{id}/distribution/order`,
    );
  }
  return entityId;
}
