/**
 * 本地 fixture → 课程文件上传（与页面上传本地文件一致）：
 *
 * - 步骤 1、3：TeacherIn 后端 `/api/v1`（loggedGet / loggedPost）
 * - 步骤 2：腾讯云 COS 直传 —— go-git 无接收字节的接口，此步不是 TeacherIn API
 */
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { TestInfo } from '@playwright/test';
import { Endpoints } from '../api/endpoints.js';
import { loggedGet, loggedPost } from '../api/logged-call.js';
import type { ApiHelper } from '../fixtures/api-helper.js';
import { putObjectToCos } from '../http/cos-direct-put.js';
import { SUCCESS_CODE, isEnvelope } from '../http/types.js';
import { pickStringField } from './ids.js';
import { uniqueName } from '../utils/random.js';

/** 与 errno.RepoCosFileConverting 一致：COS 登记后异步转 ecos，预览/转换需等待 */
export const REPO_COS_FILE_CONVERTING = 20144;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** eppt 转换用例固定 fixture（5.ppt） */
export const TRANSFORM_PPT_FIXTURE = fileURLToPath(
  new URL('../../tests/api/fixtures/transform-5.ppt', import.meta.url),
);

interface CosTokenData {
  Credentials?: {
    Token?: string;
    TmpSecretId?: string;
    TmpSecretKey?: string;
  };
  ExpiredTime?: number;
  Domain?: string;
  Region?: string;
  Bucket?: string;
  Basedir?: string;
}

export interface UploadedRepoFile {
  repoPath: string;
  previewTreePath: string;
  transformTreePath: string;
}

function unwrapCosToken(body: unknown): CosTokenData | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const root = body as Record<string, unknown>;
  if (isEnvelope(body) && body.code !== SUCCESS_CODE) return undefined;
  const data = root.data ?? root;
  return data && typeof data === 'object' ? (data as CosTokenData) : undefined;
}

function pickUploadedContent(body: unknown):
  | { path: string; name: string; fileType: string; fullPath?: string }
  | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const root = body as Record<string, unknown>;
  const data = root.data ?? root;
  if (!data || typeof data !== 'object') return undefined;
  const nested = data as Record<string, unknown>;
  const content = nested.content ?? nested;
  if (!content || typeof content !== 'object') return undefined;
  const row = content as Record<string, unknown>;
  const repoPath = pickStringField(row, 'path', 'tree_path');
  const name = pickStringField(row, 'name') ?? repoPath;
  const fileType = pickStringField(row, 'file_type') ?? 'ecos';
  const fullPath = pickStringField(row, 'full_path');
  if (!repoPath) return undefined;
  return { path: repoPath, name, fileType, fullPath };
}

function lowercaseFileSuffix(fileName: string): string {
  const dot = fileName.lastIndexOf('.');
  if (dot <= 0) return fileName;
  return `${fileName.slice(0, dot)}${fileName.slice(dot).toLowerCase()}`;
}

function buildCosObjectKey(token: CosTokenData, fileName: string): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const suffix = path.extname(fileName).toLowerCase();
  return `${token.Basedir ?? ''}${y}${m}${d}/2F_${randomUUID()}${suffix}`;
}

export function buildReportCosPayload(
  treePath: string,
  size: number,
  url: string,
  fileType = 'ecos',
): Record<string, unknown> {
  return {
    size,
    url,
    file_id: 0,
    file_type: fileType,
    tree_path: treePath,
    sha_1_code: '',
    duration: '0',
    preview_url: '',
  };
}

/** 读取 fixture → COS 直传 → POST /repos/{id}/cos */
export async function uploadLocalFileToRepo(
  api: ApiHelper,
  testInfo: TestInfo,
  apiBaseURL: string,
  repoId: string,
  options: {
    fixturePath?: string;
    treePath?: string;
    fileType?: string;
    logName?: string;
  } = {},
): Promise<UploadedRepoFile> {
  const fixturePath = options.fixturePath ?? TRANSFORM_PPT_FIXTURE;
  const buffer = await readFile(fixturePath);
  const baseName = lowercaseFileSuffix(path.basename(fixturePath));
  const treePath = options.treePath ?? `${uniqueName('ppt')}-${baseName}`;

  const tokenRes = await loggedGet(
    api,
    { testInfo, apiBaseURL, logName: 'COS token' },
    Endpoints.file.token,
    { query: { flag: 7 } },
  );
  const token = unwrapCosToken(tokenRes.body);
  const credentials = token?.Credentials;
  if (!token?.Domain || !token.Bucket || !token.Region || !credentials?.TmpSecretId || !credentials.TmpSecretKey) {
    throw new Error('GET /file/token 未返回完整 COS 凭证');
  }

  const objectKey = buildCosObjectKey(token, baseName);
  const cosUrl = await putObjectToCos({
    buffer,
    objectKey,
    bucket: token.Bucket,
    region: token.Region,
    domain: token.Domain,
    credentials: {
      TmpSecretId: credentials.TmpSecretId,
      TmpSecretKey: credentials.TmpSecretKey,
      Token: credentials.Token,
    },
  });

  const report = await loggedPost(
    api,
    { testInfo, apiBaseURL, logName: '登记课程文件', maxDurationMs: 0 },
    Endpoints.repo.cos(repoId),
    buildReportCosPayload(treePath, buffer.byteLength, cosUrl, options.fileType ?? 'ecos'),
  );
  if (isEnvelope(report.body) && report.body.code !== SUCCESS_CODE) {
    throw new Error(`POST /repos/${repoId}/cos 失败 code=${report.body.code} msg=${report.body.msg}`);
  }

  const uploaded = pickUploadedContent(report.body);
  const repoPath = uploaded?.path ?? treePath.replace(/\.[^./]+$/, '');
  const previewTreePath =
    uploaded?.fullPath ??
    (uploaded?.path && uploaded.fileType ? `${uploaded.path}.${uploaded.fileType}` : (uploaded?.name ?? treePath));
  const transformTreePath = previewTreePath;

  return { repoPath, previewTreePath, transformTreePath };
}

/** 轮询 POST /repos/{id}/preview，直到 COS→ecos 转换完成（页面亦如此） */
export async function waitForRepoFilePreviewReady(
  api: ApiHelper,
  testInfo: TestInfo,
  apiBaseURL: string,
  repoId: string,
  previewTreePath: string,
  options: { maxAttempts?: number; intervalMs?: number } = {},
): Promise<void> {
  const maxAttempts = options.maxAttempts ?? 20;
  const intervalMs = options.intervalMs ?? 5_000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const preview = await loggedPost(
      api,
      { testInfo, apiBaseURL, logName: `预览文件(${attempt}/${maxAttempts})`, maxDurationMs: 0 },
      Endpoints.repo.preview(repoId),
      { tree_path: previewTreePath, ref: 'master' },
    );
    if (isEnvelope(preview.body) && preview.body.code === REPO_COS_FILE_CONVERTING) {
      if (attempt >= maxAttempts) {
        throw new Error(`预览超时：COS 文件仍在转换中 code=${REPO_COS_FILE_CONVERTING}`);
      }
      await sleep(intervalMs);
      continue;
    }
    if (isEnvelope(preview.body) && preview.body.code !== SUCCESS_CODE) {
      throw new Error(`预览失败 code=${preview.body.code} msg=${preview.body.msg}`);
    }
    return;
  }
}
