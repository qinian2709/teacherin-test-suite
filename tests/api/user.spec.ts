import { test, loggedGet, loggedPost, Endpoints } from '@shared';
import {
  annotateScenarioApis,
  buildUserSettingsPatchPayload,
  expectApiGetSuccess,
  expectApiWriteSuccess,
  pickFirstTopicId,
  pickNumericId,
  resolveUserByPhone,
} from '@shared';

test.describe('查询本人信息-查询全部二级标签-修改本人信息 @batch1', () => {
  test('查询当前用户 @batch1', async ({ api, env }) => {
    annotateScenarioApis('查询本人信息-查询全部二级标签-修改本人信息');
    const me = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '当前用户' },
      Endpoints.user.current,
    );
    expectApiGetSuccess(me.status, me.body);
  });

  test('查标签 → 读设置 → patch @batch4', async ({ api, env }) => {
    annotateScenarioApis('查询本人信息-查询全部二级标签-修改本人信息');
    const topics = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '二级标签' },
      Endpoints.topics.category,
    );
    expectApiGetSuccess(topics.status, topics.body);
    const topicId = pickFirstTopicId(topics.body);

    const settings = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '用户设置' },
      Endpoints.user.settings,
    );
    expectApiGetSuccess(settings.status, settings.body);

    const me = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '当前用户' },
      Endpoints.user.current,
    );
    expectApiGetSuccess(me.status, me.body);
    const body = me.body as Record<string, unknown>;
    const data = (body.data ?? body) as Record<string, unknown>;
    const username = typeof data.username === 'string' ? data.username : 'patrol-user';

    const patch = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '更新个人信息' },
      Endpoints.user.settingsPatch,
      buildUserSettingsPatchPayload(username, topicId ? [topicId] : []),
    );
    expectApiWriteSuccess(patch.status, patch.body);
  });
});

test.describe('未登录-进入个人主页-查询用户所属组织-查询用户信息相关 @batch1', () => {
  test('用登录用户 id 查公开主页（id 不写死） @batch1', async ({ api, anonApi, env }) => {
    annotateScenarioApis('未登录-进入个人主页-查询用户所属组织-查询用户信息相关');
    const me = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '当前用户' },
      Endpoints.user.current,
    );
    expectApiGetSuccess(me.status, me.body);
    const userId = pickNumericId(me.body);
    if (!userId) throw new Error('当前用户响应无 id');

    const orgs = await loggedGet(
      anonApi,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '用户组织' },
      Endpoints.users.orgs(userId),
    );
    expectApiGetSuccess(orgs.status, orgs.body);

    const count = await loggedGet(
      anonApi,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '课程数量' },
      Endpoints.users.reposCount(userId),
    );
    expectApiGetSuccess(count.status, count.body);
  });
});

test.describe('获取个人关注列表-取关-关注-获取关注者列表 @batch1', () => {
  test('用当前用户查关注/粉丝（不写死对方 uid） @batch1', async ({ api, env }) => {
    annotateScenarioApis('获取个人关注列表-取关-关注-获取关注者列表');
    const me = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '当前用户' },
      Endpoints.user.current,
    );
    expectApiGetSuccess(me.status, me.body);
    const userId = pickNumericId(me.body);
    if (!userId) throw new Error('当前用户响应无 id');

    const following = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '关注列表' },
      Endpoints.users.following(userId),
      { query: { page: 1, limit: 10 } },
    );
    expectApiGetSuccess(following.status, following.body);
  });

  test('关注邀请用户 → 取关 @batch4', async ({ api, env }) => {
    annotateScenarioApis('获取个人关注列表-取关-关注-获取关注者列表');
    test.skip(!env.invitePhone, '未配置 TEST_INVITE_PHONE');

    const me = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '当前用户' },
      Endpoints.user.current,
    );
    expectApiGetSuccess(me.status, me.body);
    const myId = pickNumericId(me.body);
    if (!myId) throw new Error('当前用户响应无 id');

    const target = await resolveUserByPhone(api, env.invitePhone, env.inviteNationCode);
    test.skip(target.userId === myId, '邀请号不能与登录号相同');

    const follow = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '关注' },
      Endpoints.user.follow(target.userId),
      {},
    );
    expectApiWriteSuccess(follow.status, follow.body);

    const followers = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '粉丝列表' },
      Endpoints.users.followers(myId),
      { query: { page: 1, limit: 10 } },
    );
    expectApiGetSuccess(followers.status, followers.body);

    const unfollow = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '取关' },
      Endpoints.user.unfollow(target.userId),
      {},
    );
    expectApiWriteSuccess(unfollow.status, unfollow.body);
  });
});
