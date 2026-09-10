import { test, loggedGet, loggedPost, Endpoints } from '@shared';
import {
  annotateScenarioApis,
  expectApiGetSuccess,
  expectApiWriteSuccess,
  fetchCovers,
  provisionOrgPublishedCourse,
  pickFirstCommunityId,
} from '@shared';

test.describe('收藏课程-收藏列表查询-取消收藏 @batch4', () => {
  test('收藏 → 查列表 → 取消收藏 @batch4', async ({ api, env, data }) => {
    annotateScenarioApis('收藏课程-收藏列表查询-取消收藏');
    test.skip(!env.orgId, '未配置 TEST_ORG_ID');
    await fetchCovers(api, test.info(), env.apiBaseURL);
    const course = await provisionOrgPublishedCourse(api, data, env.orgId);

    const star = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '收藏课程' },
      Endpoints.user.starredPut(course.repoId),
      {},
    );
    expectApiWriteSuccess(star.status, star.body);

    const goods = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '商品信息' },
      Endpoints.repo.goods(course.repoId),
    );
    expectApiGetSuccess(goods.status, goods.body);

    const myRepos = await loggedGet(
      api,
      {
        testInfo: test.info(),
        apiBaseURL: env.apiBaseURL,
        logName: '我的收藏',
        maxDurationMs: 0,
      },
      Endpoints.user.repos,
      { query: { page: 1, limit: 10, type: 'starred' } },
    );
    expectApiGetSuccess(myRepos.status, myRepos.body);

    const unstar = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '取消收藏' },
      Endpoints.user.starredDelete(course.repoId),
      {},
    );
    expectApiWriteSuccess(unstar.status, unstar.body);
  });
});

test.describe('未登录组织主页-组织信息获取-组织发布课程列表-搜索-关注组织-取关组织 @batch5', () => {
  test('匿名查组织 → 关注/取关 @batch5', async ({ api, anonApi, env }) => {
    annotateScenarioApis('未登录组织主页-组织信息获取-组织发布课程列表-搜索-关注组织-取关组织');
    test.skip(!env.orgId, '未配置 TEST_ORG_ID');

    const orgInfo = await loggedGet(
      anonApi,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '组织信息' },
      Endpoints.org.one(env.orgId),
    );
    expectApiGetSuccess(orgInfo.status, orgInfo.body);

    const members = await loggedGet(
      anonApi,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '组织成员' },
      Endpoints.org.members(env.orgId),
      { query: { page: 1, limit: 10 } },
    );
    expectApiGetSuccess(members.status, members.body);

    const repos = await loggedGet(
      anonApi,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '组织课程' },
      Endpoints.org.repos(env.orgId),
      { query: { page: 1, limit: 10 } },
    );
    expectApiGetSuccess(repos.status, repos.body);

    const follow = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '关注组织' },
      Endpoints.user.follow(env.orgId),
      {},
    );
    expectApiWriteSuccess(follow.status, follow.body);

    const unfollow = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '取消关注组织' },
      Endpoints.user.unfollow(env.orgId),
      {},
    );
    expectApiWriteSuccess(unfollow.status, unfollow.body);
  });
});

test.describe('动态列表-点赞-取消点赞-热门课程列表换一换-作者推荐列表换一换 @batch6', () => {
  test('社区动态 → 点赞/取消 → 推荐列表 @batch6', async ({ api, env }) => {
    annotateScenarioApis('动态列表-点赞-取消点赞-热门课程列表换一换-作者推荐列表换一换');

    const notice = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '打开社区动态通知' },
      Endpoints.user.settingsNotice,
      { dynamic_star_notice: 0 },
    );
    expectApiWriteSuccess(notice.status, notice.body);

    const feed = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '社区动态列表' },
      Endpoints.community.list,
      { query: { page: 1, limit: 10 } },
    );
    expectApiGetSuccess(feed.status, feed.body);

    const communityId = pickFirstCommunityId(feed.body);
    if (communityId) {
      const star = await loggedPost(
        api,
        { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '点赞动态' },
        Endpoints.community.starred(communityId),
        {},
      );
      expectApiWriteSuccess(star.status, star.body);

      const unstar = await loggedPost(
        api,
        { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '取消点赞' },
        Endpoints.community.unstar(communityId),
        {},
      );
      expectApiWriteSuccess(unstar.status, unstar.body);
    }

    const repos = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '推荐课程' },
      Endpoints.community.recommendRepo,
    );
    expectApiGetSuccess(repos.status, repos.body);

    const authors = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '推荐作者' },
      Endpoints.community.recommendAuthor,
    );
    expectApiGetSuccess(authors.status, authors.body);
  });
});
