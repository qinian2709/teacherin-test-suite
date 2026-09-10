/**
 * MeterSphere 用例请求体（TI-14环境巡检 report c9b0f331…）。
 * 来源 case：161caa41 创建个人课程、a239ad4e 组织非商家、aa4e9b0c 组织商家、df66f96b 管理员发布。
 */

/** MS「创建个人课程 / 组织创建课程」共用的 custom_score 初始化串 */
export const MS_DEFAULT_CUSTOM_SCORE = JSON.stringify({
  customScore: [
    {
      scoreName: '优良评分',
      scoreId: 'ne0dc116m8memmf9nsw0',
      scoreRule: [
        { level: '优', min: 90, max: 100 },
        { level: '良', min: 80, max: 90 },
        { level: '合格', min: 60, max: 80 },
        { level: '须努力', min: 0, max: 60 },
      ],
    },
    {
      scoreName: 'ABCD',
      scoreId: '4mq25a7t5kwe2nwnczeg',
      scoreRule: [
        { level: 'A', min: 90, max: 100 },
        { level: 'B', min: 80, max: 90 },
        { level: 'C', min: 60, max: 80 },
        { level: 'D', min: 0, max: 60 },
      ],
    },
  ],
});

/** MS 图库不可用时的封面兜底（case aa4e9b0c JSR223PreProcessor） */
export const MS_FALLBACK_COVER_PATH = '/assets/images/courseCover/courseCover34.jpg';

/** MS case 161caa41：创建个人课程 */
export const MS_CREATE_PERSONAL_FIELDS = {
  default_unit_name: '未命名单元',
  lms_name: '课程设计',
  description: '',
  topics: [] as string[],
  teams: [] as number[],
  public_act_list: [] as string[],
  custom_score: MS_DEFAULT_CUSTOM_SCORE,
} as const;

/** MS case a239ad4e：组织创建课程-非商家 */
export const MS_CREATE_ORG_FIELDS = {
  lms_name: '课程设计',
  default_unit_name: '未命名单元',
  description: '',
  topics: ['初中'],
  teams: [] as number[],
  public_act_list: [] as string[],
  custom_score: MS_DEFAULT_CUSTOM_SCORE,
} as const;

/** MS case aa4e9b0c：组织创建课程-商家（仅 name 前缀不同） */
export const MS_CREATE_ORG_MERCHANT_NAME_PREFIX = '九年级数学';

/** MS case df66f96b：管理员发布普通课程（EditRepoOptions 字段） */
export const MS_ADMIN_PUBLISH_FIELDS = {
  description: '3123213',
  topics: ['API标签'],
  isCharge: false,
  sellType: 2,
  price: 0,
  fileDownloadPermission: 2,
  downloadFiles: [] as string[],
  publicFiles: [] as string[],
  publicActList: [] as string[],
  overviewTitle: '',
  overviewContent: '',
  resourceRepoList: [] as unknown[],
  repoType: 0,
  classID: '',
  originalPrice: 0,
  className: '',
  classCoverImg: '',
} as const;

/** 商家付费课发布：spread/info 要求 price>0 且已加入分销 */
export const MS_MERCHANT_PUBLISH_FIELDS = {
  ...MS_ADMIN_PUBLISH_FIELDS,
  isCharge: true,
  price: 1,
  originalPrice: 1,
  sellType: 0,
} as const;
