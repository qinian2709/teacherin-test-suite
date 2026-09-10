import { test, loggedGet, Endpoints, annotateScenarioApis, expectApiGetSuccess } from '@shared';

test.describe('在TI内搜索-课程-文件-用户-组织 @batch1', () => {
  test('全局搜索课程/用户/组织/文件 @batch1', async ({ api, env }) => {
    annotateScenarioApis('在TI内搜索-课程-文件-用户-组织');
    const repos = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '搜课程' },
      Endpoints.repo.search,
      { query: { q: 'ti', page: 1, limit: 5 } },
    );
    expectApiGetSuccess(repos.status, repos.body);

    const files = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '搜文件' },
      Endpoints.org.filesSearch,
      { query: { q: 'ti', type: 0, page: 1, limit: 5 } },
    );
    expectApiGetSuccess(files.status, files.body);

    const users = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '搜作者' },
      Endpoints.org.usersSearch,
      { query: { q: 'ti', page: 1, limit: 5 } },
    );
    expectApiGetSuccess(users.status, users.body);

    const orgs = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '搜组织' },
      Endpoints.org.orgsSearch,
      { query: { q: 'ti', page: 1, limit: 5 } },
    );
    expectApiGetSuccess(orgs.status, orgs.body);
  });
});

test.describe('中文-不同频道列表加载 @batch1', () => {
  test('频道列表 + 探索页 + 轮播 + 热搜 @batch1', async ({ anonApi, env }) => {
    annotateScenarioApis('中文-不同频道列表加载');
    const channels = await loggedGet(
      anonApi,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '频道' },
      Endpoints.explore.channelList,
    );
    expectApiGetSuccess(channels.status, channels.body);

    const explore = await loggedGet(
      anonApi,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '探索页' },
      Endpoints.explore.list,
      { query: { lang: 'zh', channelID: 1, all: true } },
    );
    expectApiGetSuccess(explore.status, explore.body);

    const banner = await loggedGet(
      anonApi,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '轮播' },
      Endpoints.explore.banner,
      { query: { lang: 'zh', channelID: 1 } },
    );
    expectApiGetSuccess(banner.status, banner.body);

    const hot = await loggedGet(
      anonApi,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '热搜' },
      Endpoints.repo.hotWords,
      { query: { lang: 'zh', t: 2, channel_id: 1 } },
    );
    expectApiGetSuccess(hot.status, hot.body);
  });
});

test.describe('探索页-二级页面加载 @batch1', () => {
  test('探索页栏目 @batch1', async ({ anonApi, env }) => {
    annotateScenarioApis('探索页-二级页面加载');
    const explore = await loggedGet(
      anonApi,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '探索页' },
      Endpoints.explore.list,
      { query: { lang: 'zh', all: true } },
    );
    expectApiGetSuccess(explore.status, explore.body);
  });
});

test.describe('在个人工作台搜索 @batch4', () => {
  test('工作台搜课程/文件 @batch4', async ({ api, env }) => {
    annotateScenarioApis('在个人工作台搜索');
    const count = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '工作台搜索计数' },
      Endpoints.user.searchCount,
      { query: { q: 'ti' } },
    );
    expectApiGetSuccess(count.status, count.body);

    const repos = await loggedGet(
      api,
      {
        testInfo: test.info(),
        apiBaseURL: env.apiBaseURL,
        logName: '工作台搜课程',
        maxDurationMs: 0,
      },
      Endpoints.user.repos,
      { query: { q: 'ti', page: 1, limit: 5 } },
    );
    expectApiGetSuccess(repos.status, repos.body);

    const files = await loggedGet(
      api,
      {
        testInfo: test.info(),
        apiBaseURL: env.apiBaseURL,
        logName: '工作台搜文件',
        maxDurationMs: 0,
      },
      Endpoints.user.files,
      { query: { q: 'ti', page: 1, limit: 5 } },
    );
    expectApiGetSuccess(files.status, files.body);

    const filesCount = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '文件分类计数' },
      Endpoints.user.filesCount,
      { query: { q: 'ti' } },
    );
    expectApiGetSuccess(filesCount.status, filesCount.body);
  });
});

test.describe('在当前组织内-搜索流程 @batch4', () => {
  test('组织工作台搜课程/文件 @batch4', async ({ api, env }) => {
    annotateScenarioApis('在当前组织内-搜索流程');
    test.skip(!env.orgId, '未配置 TEST_ORG_ID');

    const count = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '组织搜索计数' },
      Endpoints.org.authSearchCount(env.orgId),
      { query: { q: 'ti' } },
    );
    expectApiGetSuccess(count.status, count.body);

    const repos = await loggedGet(
      api,
      {
        testInfo: test.info(),
        apiBaseURL: env.apiBaseURL,
        logName: '组织搜课程',
        maxDurationMs: 0,
      },
      Endpoints.org.authRepos(env.orgId),
      { query: { q: 'ti', page: 1, limit: 5 } },
    );
    expectApiGetSuccess(repos.status, repos.body);

    const files = await loggedGet(
      api,
      {
        testInfo: test.info(),
        apiBaseURL: env.apiBaseURL,
        logName: '组织搜文件',
        maxDurationMs: 0,
      },
      Endpoints.org.authFiles(env.orgId),
      { query: { q: 'ti', page: 1, limit: 5 } },
    );
    expectApiGetSuccess(files.status, files.body);

    const filesCount = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '组织文件计数' },
      Endpoints.org.authFilesCount(env.orgId),
      { query: { q: 'ti' } },
    );
    expectApiGetSuccess(filesCount.status, filesCount.body);
  });
});

test.describe('在当前组织内搜索-课程-文件-作者 @batch4', () => {
  test('组织内搜课程/文件/作者 @batch4', async ({ api, env }) => {
    annotateScenarioApis('在当前组织内搜索-课程-文件-作者');
    test.skip(!env.orgId, '未配置 TEST_ORG_ID');

    const count = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '组织内搜索计数' },
      Endpoints.org.orgSearchCount(env.orgId),
      { query: { q: 'ti' } },
    );
    expectApiGetSuccess(count.status, count.body);

    const repos = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '组织内搜课程' },
      Endpoints.org.repos(env.orgId),
      { query: { q: 'ti', page: 1, limit: 5 } },
    );
    expectApiGetSuccess(repos.status, repos.body);

    const filesCount = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '组织内文件计数' },
      Endpoints.org.orgFilesCount(env.orgId),
      { query: { q: 'ti' } },
    );
    expectApiGetSuccess(filesCount.status, filesCount.body);

    const files = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '组织内搜文件' },
      Endpoints.org.orgFiles(env.orgId),
      { query: { q: 'ti', page: 1, limit: 5 } },
    );
    expectApiGetSuccess(files.status, files.body);

    const users = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '组织内搜作者' },
      Endpoints.org.orgUsers(env.orgId),
      { query: { q: 'ti', page: 1, limit: 5 } },
    );
    expectApiGetSuccess(users.status, users.body);
  });
});
