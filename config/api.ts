/**
 * API 自动化项目级配置（非环境变量、非 CI 变量）。
 * 调整响应耗时 SLA 只改本文件即可。
 */

/**
 * 单次后端接口响应耗时上限（ms）。
 * - 适用于用例正文步骤（`logged*` / 用例内裸 `api.*`）
 * - fixture 造数与 cleanup 使用 `shared/data/infra.ts` 的 `INFRA_API_OPTS`（跳过耗时）
 * - `0` 表示关闭全局耗时断言
 * - 单次请求仍可用 `CallOptions.maxDurationMs` / `ApiLogOptions.maxDurationMs` 覆盖
 * - 线上（TEST_ENV=production）放宽到 2500ms，其余环境 2000ms
 */
const API_MAX_RESPONSE_MS_BY_ENV: Record<string, number> = {
  production: 2500,
};

export const API_MAX_RESPONSE_MS =
  API_MAX_RESPONSE_MS_BY_ENV[(process.env.TEST_ENV ?? process.env.ENV ?? '').trim()] ?? 2000;
