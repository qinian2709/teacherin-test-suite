/**
 * 云盘 / 标签 / 课程文件响应解析。
 */
import { pickNumericId, pickStringField } from './ids.js';

export function pickFirstTopicName(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const root = body as Record<string, unknown>;
  const data = root.data ?? root;
  const list = Array.isArray(data) ? data : [];
  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const name = row.topic_name ?? row.name ?? row.topic;
    if (typeof name === 'string' && name.length > 0) return name;
  }
  return undefined;
}

function unwrapCloudData(body: unknown): Record<string, unknown> | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const root = body as Record<string, unknown>;
  const data = root.data ?? root;
  return data && typeof data === 'object' ? (data as Record<string, unknown>) : undefined;
}

export interface CloudDiskPick {
  folderId: number;
  fileId: number;
  fileName: string;
  fileExt: string;
  fileSavePath: string;
  previewImg: string;
  duration: string;
  fileSizeNumber: number;
}

function readCloudFileRow(row: Record<string, unknown>): Omit<CloudDiskPick, 'folderId'> | undefined {
  const fileId = row.fileId ?? row.file_id ?? row.id;
  const fileName = row.fileName ?? row.file_name ?? row.name;
  if (typeof fileId !== 'number' && typeof fileId !== 'string') return undefined;
  if (typeof fileName !== 'string' || fileName.length === 0) return undefined;
  return {
    fileId: Number(fileId),
    fileName,
    fileExt: String(row.fileExt ?? row.file_ext ?? '').replace(/^\./, ''),
    fileSavePath: String(row.fileSavePath ?? row.file_save_path ?? ''),
    previewImg: String(row.previewImg ?? row.preview_img ?? ''),
    duration: String(row.duration ?? '0'),
    fileSizeNumber: Number(row.fileSizeNumber ?? row.file_size_number ?? 1),
  };
}

function matchesCloudExt(file: Omit<CloudDiskPick, 'folderId'>, extensions: string[]): boolean {
  if (extensions.length === 0) return true;
  const ext = file.fileExt.toLowerCase();
  const name = file.fileName.toLowerCase();
  return extensions.some((hint) => {
    const e = hint.toLowerCase().replace(/^\./, '');
    return ext === e || name.endsWith(`.${e}`);
  });
}

function pickCloudFileFromList(
  body: unknown,
  folderId: number,
  extensions: string[],
): CloudDiskPick | undefined {
  const data = unwrapCloudData(body);
  if (!data) return undefined;
  const list = data.fileList ?? data.file_list ?? data.list;
  if (!Array.isArray(list)) return undefined;
  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const isDir = row.isDir ?? row.is_dir ?? row.type;
    if (isDir === true || isDir === 1) continue;
    const parsed = readCloudFileRow(row);
    if (!parsed || !matchesCloudExt(parsed, extensions)) continue;
    return { folderId, ...parsed };
  }
  return undefined;
}

/** 从 GET /file/cloud/list/{id} 取第一个文件（非文件夹）。 */
export function pickFirstCloudFile(
  body: unknown,
  folderId = 0,
  extensions: string[] = [],
): CloudDiskPick | undefined {
  return pickCloudFileFromList(body, folderId, extensions);
}

/** 云盘列表中按扩展名取第一个文件（如 ppt/pptx）。 */
export function pickFirstCloudFileByExt(
  body: unknown,
  folderId: number,
  extensions: string[],
): CloudDiskPick | undefined {
  return pickCloudFileFromList(body, folderId, extensions);
}

/** 云盘 breadcrumb 需 folder_id > 0；优先 folderList 首项，否则 topId。 */
export function pickCloudFolderId(body: unknown): number | undefined {
  const data = unwrapCloudData(body);
  if (!data) return undefined;
  const folderList = data.folderList ?? data.folder_list;
  if (Array.isArray(folderList)) {
    for (const item of folderList) {
      if (!item || typeof item !== 'object') continue;
      const row = item as Record<string, unknown>;
      const id = row.folderId ?? row.folder_id;
      if (typeof id === 'number' && id > 0) return id;
    }
  }
  const topId = data.topId ?? data.top_id;
  if (typeof topId === 'number' && topId > 0) return topId;
  return undefined;
}

/** 从 POST /repos/{id}/contents 取匹配扩展名的 tree_path（默认去掉末级扩展名）。 */
export function pickFirstRepoFilePath(
  body: unknown,
  extHint = 'eppt',
  stripExtension = true,
): string | undefined {
  const pathValue = pickFirstRepoTreePath(body, extHint);
  if (!pathValue) return undefined;
  return stripExtension ? pathValue.replace(/\.[^./]+$/, '') : pathValue;
}

/** 从 contents 响应取原始 path（preview/transform 需与 git 存储一致）。 */
export function pickFirstRepoTreePath(body: unknown, extHint = ''): string | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const root = body as Record<string, unknown>;
  const data = root.data ?? root;
  const list = Array.isArray(data) ? data : [];
  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const pathValue = row.path ?? row.tree_path ?? row.name;
    if (typeof pathValue !== 'string') continue;
    if (extHint && !pathValue.toLowerCase().includes(extHint.toLowerCase())) continue;
    return pathValue;
  }
  return undefined;
}

export function pickEpptTransformCallId(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const root = body as Record<string, unknown>;
  const data = root.data ?? root;
  if (!data || typeof data !== 'object') return undefined;
  return (
    pickStringField(data as Record<string, unknown>, 'callId', 'call_id', 'id', 'extra') ??
    pickNumericId(data)
  );
}
