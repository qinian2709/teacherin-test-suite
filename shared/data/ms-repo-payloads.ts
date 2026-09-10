/**
 * MeterSphere 课程操作请求体（report c9b0f331…）。
 * 08184247 新建文件夹、73082023 课程保存为模版、8f27fc35 重命名个人空间课程名称。
 */
import { uniqueName } from '../utils/random.js';

function msTimeSuffix(): string {
  return String(Date.now());
}

/** MS case 8f27fc35：POST /repos/{repoid}/name */
export function buildRenameRepoPayload(name?: string): Record<string, unknown> {
  return {
    name: name ?? `重命名${msTimeSuffix()}`,
  };
}

/** MS case 73082023：POST /repos/{repoid}/template */
export function buildSaveTemplatePayload(
  repoName?: string,
  orgId: number | string = 0,
): Record<string, unknown> {
  return {
    repo_name: repoName ?? `课程模版${msTimeSuffix()}`,
    preview_image: '',
    org_id: Number(orgId),
  };
}

/** MS case「更换课程背景」：POST /repos/{repoid}/background */
export function buildChangeBackgroundPayload(backgroundUrl: string): Record<string, unknown> {
  return { background: backgroundUrl };
}

/** MS case 08184247：POST /repos/{repoid}/contents/gitkeep */
export function buildGitkeepPayload(treePath?: string): Record<string, unknown> {
  return {
    tree_path: treePath ?? `${uniqueName('dir')}/.gitkeep`,
    content: '',
  };
}

/** MS「重命名模版名称」：POST /repos/{repoid}/template/patch */
export function buildTemplatePatchPayload(name?: string): Record<string, unknown> {
  return { name: name ?? `模版重命名${msTimeSuffix()}` };
}

/** MS「组织公共区导入课程」：POST /repos/{repoid}/import/orgs/{orgid} */
export function buildImportToOrgPayload(teamId = -1): Record<string, unknown> {
  return { team_id: teamId };
}

/** MS「组织空间使用模板创建课程」：POST /orgs/{orgid}/repos */
export function buildCreateFromTemplatePayload(
  templateId: string | number,
  name?: string,
): Record<string, unknown> {
  return {
    name: name ?? `模板建课${msTimeSuffix()}`,
    template_id: Number(templateId),
    teams: [-1],
  };
}

/** MS「添加课程协作者」：POST /repos/{repoid}/collaborators/put */
export function buildAddCollaboratorsPayload(
  userId: string,
  roleId = 11,
): Record<string, unknown> {
  return {
    Collaborators: [{ user_id: Number(userId), role_id: roleId }],
  };
}

/** POST /repos/{repoid}/collaborators/{uid} 修改权限 */
export function buildCollaboratorPatchPayload(roleId: number): Record<string, unknown> {
  return { role_id: roleId };
}

/** MS「团队转让管理员」 */
export function buildTeamPromotePayload(ownerId: string): Record<string, unknown> {
  return { owner_id: Number(ownerId) };
}
