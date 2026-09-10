/**
 * 课程数据构造（不是用例步骤）：
 * 1. 个人：创建课程 → 结束后删除
 * 2. 组织/商家：创建课程 → 发布 → 结束后删除
 */
import type { ApiHelper } from '../fixtures/api-helper.js';
import { Endpoints } from '../api/endpoints.js';
import type { DataRegistry } from './cleanup.js';
import { resolveGalleryImages } from './gallery-images.js';
import { INFRA_API_OPTS } from './infra.js';
import { pickFirstRepoId, pickNumericId, pickRepoIdByName } from './ids.js';
import {
  MS_ADMIN_PUBLISH_FIELDS,
  MS_MERCHANT_PUBLISH_FIELDS,
  MS_CREATE_ORG_FIELDS,
  MS_CREATE_ORG_MERCHANT_NAME_PREFIX,
  MS_CREATE_PERSONAL_FIELDS,
} from './ms-course-templates.js';
import { uniqueName } from '../utils/random.js';

export type CourseOwnerKind = 'personal' | 'org' | 'merchant';

export interface ProvisionedCourse {
  repoId: string;
  name: string;
  kind: CourseOwnerKind;
  orgId?: string;
  published: boolean;
}

export interface CreateRepoOverrides {
  name?: string;
  description?: string;
  cover_img?: string;
  background?: string;
  orgid?: string;
  [key: string]: unknown;
}

export interface CourseMediaUrls {
  coverUrl: string;
  backgroundUrl: string;
}

function msTimestampSuffix(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/** MS case 161caa41 + go-git 必填字段 */
export function buildCreatePersonalRepoPayload(
  media: CourseMediaUrls,
  overrides: CreateRepoOverrides = {},
): Record<string, unknown> {
  return {
    ...MS_CREATE_PERSONAL_FIELDS,
    name: `新建课程${uniqueName('')}`,
    cover_img: media.coverUrl,
    background: media.backgroundUrl,
    template_id: 0,
    theme_color: '',
    readme: '',
    auto_init: true,
    ...overrides,
  };
}

/** MS case a239ad4e / aa4e9b0c + go-git 必填字段 */
export function buildCreateOrgRepoPayload(
  orgId: string,
  media: CourseMediaUrls,
  kind: 'org' | 'merchant',
  overrides: CreateRepoOverrides = {},
): Record<string, unknown> {
  const namePrefix = kind === 'merchant' ? MS_CREATE_ORG_MERCHANT_NAME_PREFIX : '新建课程';
  return {
    ...MS_CREATE_ORG_FIELDS,
    orgid: orgId,
    name: `${namePrefix}${uniqueName('')}`,
    cover_img: media.coverUrl,
    background: media.backgroundUrl,
    template_id: 0,
    theme_color: '',
    readme: '',
    auto_init: true,
    ...overrides,
  };
}

/** @deprecated 用 buildCreatePersonalRepoPayload / buildCreateOrgRepoPayload */
export function buildCreateRepoPayload(
  overrides: CreateRepoOverrides = {},
): Record<string, unknown> {
  return buildCreatePersonalRepoPayload(
    {
      coverUrl: String(overrides.cover_img ?? ''),
      backgroundUrl: String(overrides.background ?? ''),
    },
    overrides,
  );
}

/** MS case df66f96b：管理员发布普通课程 */
export function buildPublishPayload(name: string, coverUrl: string): Record<string, unknown> {
  return {
    ...MS_ADMIN_PUBLISH_FIELDS,
    name,
    coverImg: coverUrl,
  };
}

/** 商家付费课发布（推广/分销前置） */
export function buildMerchantPublishPayload(name: string, coverUrl: string): Record<string, unknown> {
  return {
    ...MS_MERCHANT_PUBLISH_FIELDS,
    name,
    coverImg: coverUrl,
  };
}

function fail(action: string, method: string, path: string, status: number, body: unknown): never {
  throw new Error(`${action}失败 ${method} ${path} HTTP ${status} body=${JSON.stringify(body)}`);
}

export async function deleteCourse(api: ApiHelper, repoId: string): Promise<void> {
  const path = Endpoints.repo.delete(repoId);
  const result = await api.post(path, {}, INFRA_API_OPTS);
  if (!result.ok && result.status >= 500) {
    fail('删除课程', 'POST', path, result.status, result.body);
  }
}

/** MS「组织管理员删除课程」：已发布组织课用 admin/delete。 */
export async function deletePublishedOrgCourse(api: ApiHelper, repoId: string): Promise<void> {
  const path = Endpoints.repo.adminDelete(repoId);
  const result = await api.post(path, {}, INFRA_API_OPTS);
  if (!result.ok && result.status >= 500) {
    fail('管理员删除课程', 'POST', path, result.status, result.body);
  }
}

interface CleanupOptions {
  published?: boolean;
}

function registerCleanup(
  data: DataRegistry,
  api: ApiHelper,
  repoId: string,
  kind: CourseOwnerKind,
  options: CleanupOptions = {},
): void {
  const published = options.published ?? false;
  data.register(`delete-${kind}-course-${repoId}`, async () => {
    if (published) {
      await deletePublishedOrgCourse(api, repoId);
    } else {
      await deleteCourse(api, repoId);
    }
  });
}

function businessCode(body: unknown): number | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const code = (body as { code?: unknown }).code;
  return typeof code === 'number' ? code : undefined;
}

async function createRepo(
  api: ApiHelper,
  path: string,
  payload: Record<string, unknown>,
  action: string,
): Promise<string> {
  const result = await api.post(path, payload, INFRA_API_OPTS);
  const code = businessCode(result.body);
  if (!result.ok || (code !== undefined && code !== 0)) {
    fail(action, 'POST', path, result.status, result.body);
  }
  const repoId = pickNumericId(result.body);
  if (!repoId) fail(`${action}（无 id）`, 'POST', path, result.status, result.body);
  return repoId;
}

async function publishRepo(
  api: ApiHelper,
  repoId: string,
  name: string,
  coverUrl: string,
): Promise<void> {
  const path = Endpoints.repo.adminPublish(repoId);
  const result = await api.post(path, buildPublishPayload(name, coverUrl), INFRA_API_OPTS);
  if (!result.ok) fail('发布课程', 'POST', path, result.status, result.body);
}

async function publishMerchantRepo(
  api: ApiHelper,
  repoId: string,
  name: string,
  coverUrl: string,
): Promise<void> {
  const path = Endpoints.repo.adminPublish(repoId);
  const result = await api.post(path, buildMerchantPublishPayload(name, coverUrl), INFRA_API_OPTS);
  const code = businessCode(result.body);
  if (!result.ok || (code !== undefined && code !== 0)) {
    fail('发布商家付费课程', 'POST', path, result.status, result.body);
  }
}

/** 个人空间：创建课程，DataRegistry 结束时删除。 */
export async function provisionPersonalCourse(
  api: ApiHelper,
  data: DataRegistry,
  overrides: CreateRepoOverrides = {},
): Promise<ProvisionedCourse> {
  const media = await resolveGalleryImages(api);
  const payload = buildCreatePersonalRepoPayload(media, overrides);
  const repoId = await createRepo(api, Endpoints.repo.createPersonal, payload, '创建个人课程');
  registerCleanup(data, api, repoId, 'personal');
  return {
    repoId,
    name: String(payload.name),
    kind: 'personal',
    published: false,
  };
}

/** 组织：仅创建课程（未发布），结束后普通 delete。 */
export async function provisionOrgCourse(
  api: ApiHelper,
  data: DataRegistry,
  orgId: string,
  overrides: CreateRepoOverrides = {},
): Promise<ProvisionedCourse> {
  if (!orgId) throw new Error('provisionOrgCourse 需要 orgId（TEST_ORG_ID）');
  const media = await resolveGalleryImages(api);
  const payload = buildCreateOrgRepoPayload(orgId, media, 'org', overrides);
  const repoId = await createRepo(api, Endpoints.repo.createOrg(orgId), payload, '创建组织课程');
  registerCleanup(data, api, repoId, 'org', { published: false });
  return {
    repoId,
    name: String(payload.name),
    kind: 'org',
    orgId,
    published: false,
  };
}

/** 组织：创建课程 → 管理员发布，结束后 admin/delete。 */
export async function provisionOrgPublishedCourse(
  api: ApiHelper,
  data: DataRegistry,
  orgId: string,
  overrides: CreateRepoOverrides = {},
): Promise<ProvisionedCourse> {
  if (!orgId) throw new Error('provisionOrgPublishedCourse 需要 orgId（TEST_ORG_ID）');
  const media = await resolveGalleryImages(api);
  const payload = buildCreateOrgRepoPayload(orgId, media, 'org', overrides);
  const repoId = await createRepo(api, Endpoints.repo.createOrg(orgId), payload, '创建组织课程');
  await publishRepo(api, repoId, String(payload.name), media.coverUrl);
  registerCleanup(data, api, repoId, 'org', { published: true });
  return {
    repoId,
    name: String(payload.name),
    kind: 'org',
    orgId,
    published: true,
  };
}

/** 存模板响应常无 id，回查模版列表解析 template/repo id。 */
export async function resolveTemplateIdAfterSave(
  api: ApiHelper,
  listPath: string,
  templateName: string,
): Promise<string> {
  const list = await api.get(listPath, {
    ...INFRA_API_OPTS,
    query: { page: 1, limit: 50 },
    maxDurationMs: 0,
  });
  const byName = pickRepoIdByName(list.body, templateName);
  if (byName) return byName;
  const first = pickFirstRepoId(list.body);
  if (!first) throw new Error(`模版列表无 id（name=${templateName}）`);
  return first;
}

/** 商家：在组织下创建课程 → 管理员发布，结束后 admin/delete。 */
export async function provisionMerchantPublishedCourse(
  api: ApiHelper,
  data: DataRegistry,
  orgId: string,
  overrides: CreateRepoOverrides = {},
): Promise<ProvisionedCourse> {
  if (!orgId) throw new Error('provisionMerchantPublishedCourse 需要 orgId（商家所属组织 TEST_ORG_ID）');
  const media = await resolveGalleryImages(api);
  const payload = buildCreateOrgRepoPayload(orgId, media, 'merchant', overrides);
  const repoId = await createRepo(api, Endpoints.repo.createOrg(orgId), payload, '创建商家课程');
  await publishMerchantRepo(api, repoId, String(payload.name), media.coverUrl);
  registerCleanup(data, api, repoId, 'merchant', { published: true });
  return {
    repoId,
    name: String(payload.name),
    kind: 'merchant',
    orgId,
    published: true,
  };
}
