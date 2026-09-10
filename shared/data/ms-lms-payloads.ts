/**
 * LMS / 评分方案 / 素养量规 请求体（MeterSphere + go-git structs）。
 */
import { randomString, uniqueName } from '../utils/random.js';

/** go-git 风格 20 位 id */
export function lmsId(): string {
  return randomString(20);
}

/** POST /repos/{repoid}/lms — 新建单元 */
export function buildCreateLmsUnitPayload(
  parentUnitId: string,
  title?: string,
): Record<string, unknown> {
  return {
    lmsData: {
      unitName: title ?? `API新建单元${uniqueName('')}`,
      content: 'API新建单元内容',
      unitPublishFlag: 2,
      activities: [],
    },
    lmsPosition: [parentUnitId],
    targetUnitId: '-1',
  };
}

/** POST /repos/{repoid}/lms/put — 编辑单元 */
export function buildUpdateLmsUnitPayload(
  unitId: string,
  title?: string,
): Record<string, unknown> {
  return {
    lmsData: {
      unitName: title ?? `API编辑单元${uniqueName('')}`,
      content: 'API编辑单元内容',
      unitPublishFlag: 2,
      unitId,
      activities: [],
    },
    lmsPosition: [unitId],
  };
}

/** POST /repos/{repoid}/lms/lock | lock/delete */
export function buildLmsLockPayload(unitId: string): Record<string, unknown> {
  return { action_id: unitId, module_id: 0 };
}

/** POST /repos/{repoid}/lms/move */
export function buildLmsMovePayload(fromUnitId: string, toUnitId: string): Record<string, unknown> {
  return {
    from: [fromUnitId],
    to: [toUnitId],
    nameSuffix: '',
  };
}

/** POST /repos/{repoid}/lms/copy */
export function buildLmsCopyUnitPayload(unitId: string): Record<string, unknown> {
  return {
    copyType: 1,
    from: [unitId],
    includeFile: true,
    nameSuffix: '副本',
    copyCount: 1,
  };
}

/** POST /repos/{repoid}/lms/delete */
export function buildLmsDeletePayload(unitId: string): Record<string, unknown> {
  return {
    delete_act: true,
    lmsPosition: [unitId],
    to: [],
  };
}

const DEFAULT_SCORE_RULES = [
  { level: '优', min: 90, max: 100 },
  { level: '良', min: 80, max: 90 },
  { level: '合格', min: 60, max: 80 },
  { level: '须努力', min: 0, max: 60 },
];

/** POST /repos/{repoid}/cs/create */
export function buildCreateCustomScorePayload(name?: string): Record<string, unknown> {
  const scoreId = lmsId();
  return {
    scoreName: name ?? `API评分${uniqueName('')}`,
    scoreId,
    scoreRule: DEFAULT_SCORE_RULES,
  };
}

/** POST /repos/{repoid}/cs/update */
export function buildUpdateCustomScorePayload(
  scoreId: string,
  scoreName: string,
): Record<string, unknown> {
  return {
    scoreName: `${scoreName}-更新`,
    scoreId,
    scoreRule: DEFAULT_SCORE_RULES,
  };
}

/** POST /repos/{repoid}/cs/delete */
export function buildDeleteCustomScorePayload(scoreId: string): Record<string, unknown> {
  return { scoreId };
}

function buildLit2GradeInfo(): Record<string, unknown>[] {
  const percents = [40, 60, 80, 100];
  return percents.map((percent, i) => ({
    gradeId: lmsId(),
    gradeName: `水平${i + 1}`,
    gradePercent: percent,
  }));
}

/** POST /repos/{repoid}/lit2/create */
export function buildCreateLit2ModelPayload(name?: string): Record<string, unknown> {
  const modelId = lmsId();
  const grades = buildLit2GradeInfo();
  const gradeMap = Object.fromEntries(grades.map((g) => [g.gradeId as string, '']));
  return {
    modelName: name ?? `能力模型${uniqueName('')}`,
    modelDesc: '',
    modelLevel: 1,
    modelId,
    gradeInfo: grades,
    dimensions: [
      {
        dimensionName: '',
        dimensionDesc: '',
        dimensionId: '',
        secondDimensions: [
          {
            secondDimensionName: '',
            secondDimensionDesc: '',
            secondDimensionId: lmsId(),
            indexes: [
              {
                indexName: '能力指标',
                indexDesc: '',
                indexId: lmsId(),
                grades: gradeMap,
              },
            ],
          },
        ],
      },
    ],
  };
}

/** POST /repos/{repoid}/lit2/update — 沿用 create 结构改名称 */
export function buildUpdateLit2ModelPayload(
  createPayload: Record<string, unknown>,
  newName?: string,
): Record<string, unknown> {
  return {
    ...createPayload,
    modelName: newName ?? `${createPayload.modelName}-更新`,
  };
}

/** POST /repos/{repoid}/lit2/detection */
export function buildLit2DetectionPayload(modelId: string): Record<string, unknown> {
  return { modelId };
}

/** POST /repos/{repoid}/share/teams */
export function buildShareTeamsPayload(teamIds: number[] = [-1], roleId = 12): Record<string, unknown> {
  return { teamIds, roleId };
}

/** POST /user/settings/notice */
export function buildNoticeSettingsPayload(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    follow_me_notice: 0,
    dynamic_star_notice: 0,
    follow_user_dynamic: true,
    follow_org_dynamic: true,
    star_repo_dynamic: true,
    build_repo_notice: true,
    activity_notice: true,
    ...overrides,
  };
}

/** POST /orgs/{orgid}/background */
export function buildOrgBackgroundPayload(backgroundUrl: string): Record<string, unknown> {
  return { background: backgroundUrl };
}
