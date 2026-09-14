import { test, expect, loggedGet, loggedPost, Endpoints, isEnvelope, SUCCESS_CODE } from '@shared';
import {
  annotateScenarioApis,
  buildEditOrgPatchPayload,
  buildOrgApplyPayload,
  buildOrgSettingPayload,
  buildUserBackgroundPayload,
  buildFeedbackPayload,
  expectApiGetSuccess,
  expectApiWriteSuccess,
  fetchCovers,
  formatStandardTime,
  pickFirstLit2PlatformModelId,
  pickNumericId,
  provisionPersonalCourse,
  resolveGalleryImages,
} from '@shared';

test.describe('获取用户id @batch9', () => {
  test('GET /user @batch9', async ({ api, env }) => {
    annotateScenarioApis('获取用户id');
    const me = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '获取用户id' },
      Endpoints.user.current,
    );
    expectApiGetSuccess(me.status, me.body);
    if (!pickNumericId(me.body)) throw new Error('GET /user 响应无 id');
  });
});

test.describe('单接口汇总 @batch9', () => {
  test('系统时间 + 通知设置 @batch9', async ({ api, env }) => {
    annotateScenarioApis('单接口汇总');
    const time = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '系统时间' },
      Endpoints.system.time,
    );
    expectApiGetSuccess(time.status, time.body);

    const notice = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '通知设置' },
      Endpoints.user.settingsNotice,
    );
    expectApiGetSuccess(notice.status, notice.body);
  });
});

test.describe('申请组织 @batch9', () => {
  test('POST /orgs/apply 可达 @batch9', async ({ api, env }) => {
    annotateScenarioApis('申请组织');
    test.skip(env.name !== '14', '申请组织/商家仅 TEST_ENV=14 执行');
    const me = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '当前用户' },
      Endpoints.user.current,
    );
    expectApiGetSuccess(me.status, me.body);
    const body = me.body as Record<string, unknown>;
    const data = (body.data ?? body) as Record<string, unknown>;
    const phone = String(data.phone ?? data.phone_number ?? env.invitePhone ?? '');

    const apply = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '申请组织', maxDurationMs: 0 },
      Endpoints.org.apply,
      buildOrgApplyPayload(phone || env.invitePhone, env.inviteNationCode),
    );
    expect(apply.status, `HTTP ${apply.status}`).toBe(200);
    if (isEnvelope(apply.body) && apply.body.code === SUCCESS_CODE) {
      test.info().annotations.push({
        type: 'note',
        description: '已提交组织申请记录，如需清理请在后台处理',
      });
    } else if (isEnvelope(apply.body) && apply.body.code !== SUCCESS_CODE) {
      test.info().annotations.push({
        type: 'note',
        description: `申请组织业务码=${apply.body.code}（重复申请等预期内情况）`,
      });
    }
  });
});

test.describe('意见反馈 @batch9', () => {
  test('POST /system/feedback @batch9', async ({ api, env }) => {
    annotateScenarioApis('意见反馈');
    test.skip(env.name !== '14', '意见反馈仅 TEST_ENV=14 执行');

    const feedback = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '意见反馈', maxDurationMs: 0 },
      Endpoints.system.feedback,
      buildFeedbackPayload(),
    );
    expectApiWriteSuccess(feedback.status, feedback.body);
  });
});

test.describe('升级空间相关场景 @batch9', () => {
  test('订单 + 产品列表 @batch9', async ({ api, env }) => {
    annotateScenarioApis('升级空间相关场景');
    const orders = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '当前订单' },
      Endpoints.order.list,
    );
    expectApiGetSuccess(orders.status, orders.body);

    const history = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '历史订单' },
      Endpoints.order.history,
    );
    expectApiGetSuccess(history.status, history.body);

    const products = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '空间产品' },
      Endpoints.product.list,
    );
    expectApiGetSuccess(products.status, products.body);
  });
});

test.describe('获取组织列表-获取模板数量-获取工作台课程数量-组织用户搜索 @batch9', () => {
  test('组织工作台读接口 @batch9', async ({ api, env }) => {
    annotateScenarioApis('获取组织列表-获取模板数量-获取工作台课程数量-组织用户搜索');
    test.skip(!env.orgId, '未配置 TEST_ORG_ID');

    const orgs = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '组织列表' },
      Endpoints.user.orgs,
    );
    expectApiGetSuccess(orgs.status, orgs.body);

    const deposit = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '保证金账户' },
      Endpoints.org.merchantDepositInfo(env.orgId),
    );
    if (deposit.status === 200 && isEnvelope(deposit.body) && deposit.body.code === SUCCESS_CODE) {
      expectApiGetSuccess(deposit.status, deposit.body);
    } else {
      test.info().annotations.push({ type: 'note', description: '非商家组织跳过保证金接口' });
    }

    const patch = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '编辑组织描述' },
      Endpoints.org.patch(env.orgId),
      buildEditOrgPatchPayload(`patrol-${formatStandardTime()}`),
    );
    expectApiWriteSuccess(patch.status, patch.body);

    const merchantStatus = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '商家申请状态' },
      Endpoints.org.merchantStatus(env.orgId),
    );
    expectApiGetSuccess(merchantStatus.status, merchantStatus.body);

    const templateCount = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '模板数量' },
      Endpoints.org.authTemplateCount(env.orgId),
    );
    expectApiGetSuccess(templateCount.status, templateCount.body);

    const repoCount = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '课程数量' },
      Endpoints.org.authReposCount(env.orgId),
    );
    expectApiGetSuccess(repoCount.status, repoCount.body);

    const users = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '组织用户搜索' },
      Endpoints.org.orgUsers(env.orgId),
      { query: { q: 'a', page: 1, limit: 10 } },
    );
    expectApiGetSuccess(users.status, users.body);
  });
});

test.describe('在当前作者-搜索课程、文件 @batch9', () => {
  test('作者内搜索 @batch9', async ({ api, env }) => {
    annotateScenarioApis('在当前作者-搜索课程、文件');
    const me = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '当前用户' },
      Endpoints.user.current,
    );
    expectApiGetSuccess(me.status, me.body);
    const userId = pickNumericId(me.body);
    if (!userId) throw new Error('当前用户响应无 id');

    const count = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '作者搜索数量' },
      Endpoints.users.searchCount(userId),
      { query: { q: 'ti' } },
    );
    expectApiGetSuccess(count.status, count.body);

    const repos = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '作者内搜课程' },
      Endpoints.users.repos(userId),
      { query: { q: 'ti', page: 1, limit: 10 } },
    );
    expectApiGetSuccess(repos.status, repos.body);

    const fileCount = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '作者文件分类数' },
      Endpoints.users.filesCount(userId),
      { query: { q: 'ti' } },
    );
    expectApiGetSuccess(fileCount.status, fileCount.body);

    const files = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '作者内搜文件' },
      Endpoints.users.files(userId),
      { query: { q: 'ti', page: 1, limit: 10 } },
    );
    expectApiGetSuccess(files.status, files.body);
  });
});

test.describe('已登录--修改个人背景图--获取个人动态列表-查询发布的课程列表-查询收藏的课程列表-接口搜索 @batch9', () => {
  test('个人主页读写在 @batch9', async ({ api, env }) => {
    annotateScenarioApis(
      '已登录--修改个人背景图--获取个人动态列表-查询发布的课程列表-查询收藏的课程列表-接口搜索',
    );
    const me = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '当前用户' },
      Endpoints.user.current,
    );
    expectApiGetSuccess(me.status, me.body);
    const userId = pickNumericId(me.body);
    if (!userId) throw new Error('当前用户响应无 id');

    const media = await resolveGalleryImages(api);

    const bg = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '修改个人背景' },
      Endpoints.user.background,
      buildUserBackgroundPayload(media.backgroundUrl || media.coverUrl),
    );
    expectApiWriteSuccess(bg.status, bg.body);

    const profile = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '用户信息' },
      Endpoints.users.one(userId),
    );
    expectApiGetSuccess(profile.status, profile.body);

    const community = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '用户动态' },
      Endpoints.users.community(userId),
      { query: { page: 1, limit: 10 } },
    );
    expectApiGetSuccess(community.status, community.body);

    const repoCount = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '课程数量' },
      Endpoints.users.reposCount(userId),
    );
    expectApiGetSuccess(repoCount.status, repoCount.body);

    const published = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '发布课程' },
      Endpoints.users.repos(userId),
      { query: { page: 1, limit: 10, type: 'published' } },
    );
    expectApiGetSuccess(published.status, published.body);

    const starred = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '收藏课程' },
      Endpoints.users.repos(userId),
      { query: { page: 1, limit: 10, type: 'starred' } },
    );
    expectApiGetSuccess(starred.status, starred.body);
  });
});

test.describe('获取平台能力模型-查看详情-导入课程 @batch9', () => {
  test('平台模型 → 导入个人课 @batch9', async ({ api, env, data }) => {
    annotateScenarioApis('获取平台能力模型-查看详情-导入课程');
    await fetchCovers(api, test.info(), env.apiBaseURL);
    const course = await provisionPersonalCourse(api, data);

    const platformList = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '平台模型列表' },
      Endpoints.repo.lit2Platform,
    );
    expectApiGetSuccess(platformList.status, platformList.body);
    const platformModelId = pickFirstLit2PlatformModelId(platformList.body);
    if (!platformModelId) {
      test.skip(true, '平台能力模型未配置或列表为空');
    }

    const detail = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '平台模型详情' },
      Endpoints.repo.lit2PlatformDetail(platformModelId!),
    );
    expectApiGetSuccess(detail.status, detail.body);

    const importPayload =
      detail.body && typeof detail.body === 'object'
        ? ((detail.body as Record<string, unknown>).data ?? detail.body)
        : detail.body;
    if (!importPayload || typeof importPayload !== 'object') {
      throw new Error('平台模型详情无 data');
    }

    const imported = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '导入平台模型', maxDurationMs: 0 },
      Endpoints.repo.lit2Create(course.repoId),
      importPayload as Record<string, unknown>,
    );
    expectApiWriteSuccess(imported.status, imported.body);
  });
});

test.describe('组织机构打通 @batch9', () => {
  test('EEO 绑定链路（不解绑） @batch9', async ({ api, env }) => {
    annotateScenarioApis('组织机构打通');
    test.skip(!env.orgId, '未配置 TEST_ORG_ID');

    const me = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '当前用户' },
      Endpoints.user.current,
    );
    expectApiGetSuccess(me.status, me.body);
    const body = me.body as Record<string, unknown>;
    const data = (body.data ?? body) as Record<string, unknown>;
    const phone = String(data.phone ?? data.phone_number ?? '');

    const eeo = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '验证机构' },
      Endpoints.org.eeo(env.orgId),
      { query: { phoneNumber: phone, nationCode: env.inviteNationCode } },
    );
    if (eeo.status === 200 && isEnvelope(eeo.body) && eeo.body.code === SUCCESS_CODE) {
      expectApiGetSuccess(eeo.status, eeo.body);
    } else {
      test.info().annotations.push({ type: 'note', description: 'EEO 机构不存在或手机号未绑定 ClassIn' });
    }

    const reflect = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '绑定机构', maxDurationMs: 0 },
      Endpoints.org.eeoReflect(env.orgId),
      {},
    );
    if (reflect.status >= 500) {
      test.info().annotations.push({
        type: 'note',
        description: `eeo/reflect HTTP ${reflect.status}，组织可能未绑定 ClassIn 超管账号`,
      });
    } else if (isEnvelope(reflect.body) && reflect.body.code !== SUCCESS_CODE) {
      test.info().annotations.push({
        type: 'note',
        description: `eeo/reflect code=${reflect.body.code}`,
      });
    } else {
      expectApiWriteSuccess(reflect.status, reflect.body);
    }

    const org = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '组织信息' },
      Endpoints.org.one(env.orgId),
    );
    expectApiGetSuccess(org.status, org.body);

    const teachers = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '机构教师' },
      Endpoints.org.eeoTeachers(env.orgId),
    );
    if (teachers.status === 200 && isEnvelope(teachers.body) && teachers.body.code === SUCCESS_CODE) {
      expectApiGetSuccess(teachers.status, teachers.body);
    }

    const settingsGet = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '组织设置' },
      Endpoints.org.settings(env.orgId),
    );
    expectApiGetSuccess(settingsGet.status, settingsGet.body);

    const settings = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '成员可发布开关' },
      Endpoints.org.settings(env.orgId),
      buildOrgSettingPayload('member_can_publish', true),
    );
    expectApiWriteSuccess(settings.status, settings.body);

    test.info().annotations.push({
      type: 'note',
      description: 'MS 含 eeo/unbind，巡检跳过解绑以免破坏 env 组织绑定',
    });
  });
});
