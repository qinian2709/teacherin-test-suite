/**
 * 课程副本、标签、云盘、文档、口语卡等 MS 请求体。
 */
import { uniqueFilePath } from '../utils/random.js';
import type { CloudDiskPick } from './file-helpers.js';

/** POST /repos/{repoid}/copy */
export function buildCopyRepoPayload(prefix = '副本'): Record<string, unknown> {
  return { prefix };
}

/** POST /topics/lenovo */
export function buildTopicsLenovoPayload(
  repoId: string,
  keyword = '学',
  selected: string[] = [],
): Record<string, unknown> {
  return {
    keyword,
    selected,
    repo_id: Number(repoId),
  };
}

/** POST /repos/{repoid}/topics/single/put | delete */
export function buildRepoTopicPayload(topic: string): Record<string, unknown> {
  return { topic };
}

/** POST /repos/{repoid}/newbee/auth */
export function buildNewbeeAuthPayload(
  fullPath: string,
  permission: 'read' | 'write' = 'write',
): Record<string, unknown> {
  return { full_path: fullPath, permission, ref: '' };
}

/** POST /repos/{repoid}/newbee/create */
export function buildNewbeeCreatePayload(fullPath?: string): Record<string, unknown> {
  return { full_path: fullPath ?? `${uniqueFilePath('doc')}.nb` };
}

/** POST /repos/{repoid}/eppt/new — tree_path 不含 .eppt 后缀（后端会自动拼接）。 */
export function buildEpptNewPayload(treePath?: string, language = 'zh'): Record<string, unknown> {
  return {
    language,
    tree_path: treePath ?? uniqueFilePath('slide'),
  };
}

/** POST /repos/speaking/create */
export function buildSpeakingCreatePayload(content: string[] = ['hello']): Record<string, unknown> {
  return { content, ignoreTTS: true };
}

/** POST /repos/speaking/validate | import — MS 批量导入样例 */
export function buildSpeakingImportPayload(): Record<string, unknown>[] {
  return [
    {
      content: 'weather',
      phonetic: '/ ˈweðər /',
      paraphrase: 'n.天气，气象',
      line: 3,
    },
    {
      content: 'The weather is good today.',
      phonetic: '',
      paraphrase: '今天天气很好。',
      line: 4,
    },
  ];
}

/** @deprecated 使用 buildSpeakingImportPayload */
export function buildSpeakingValidatePayload(): Record<string, unknown>[] {
  return buildSpeakingImportPayload();
}

/** POST /repos/{repoid}/cos/batch — 从云盘选文件 */
export function buildCosBatchPayload(
  file: CloudDiskPick,
  treePath?: string,
  fileType?: string,
): Record<string, unknown> {
  const base = treePath ?? uniqueFilePath('cloud');
  const resolvedType = fileType ?? (file.fileExt || 'pdf');
  return {
    file: [
      {
        file_id: file.fileId,
        tree_path: base,
        file_type: resolvedType,
        url: file.fileSavePath,
        size: Math.max(file.fileSizeNumber * 1024, 1024),
        sha_1_code: '',
        duration: file.duration || '0',
        preview_url: file.previewImg,
      },
    ],
    dir: [],
  };
}

/** POST /repos/{repoid}/contents — 课程文件列表 */
export function buildRepoContentsPayload(treePath = ''): Record<string, unknown> {
  return { tree_path: treePath };
}

/** POST /repos/{repoid}/eppt/transform */
export function buildEpptTransformPayload(treePath: string, ref = 'master'): Record<string, unknown> {
  return { tree_path: treePath, ref, file_id: '0', file_sign: '', file_type: '' };
}
