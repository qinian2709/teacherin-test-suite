import { test, loggedGet, Endpoints, annotateScenarioApis, expectApiGetSuccess } from '@shared';

test.describe('用户访问工作台全流程 @batch1', () => {
  test('上次访问空间 + 名下组织 @batch1', async ({ api, env }) => {
    annotateScenarioApis('用户访问工作台全流程');
    const history = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '上次访问' },
      Endpoints.user.historyView('1'),
    );
    expectApiGetSuccess(history.status, history.body);

    const orgs = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '我的组织' },
      Endpoints.user.orgs,
    );
    expectApiGetSuccess(orgs.status, orgs.body);
  });
});

test.describe('获取组织性质列表 @batch1', () => {
  test('GET /orgs/apply @batch1', async ({ api, env }) => {
    annotateScenarioApis('获取组织性质列表');
    const result = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '组织性质' },
      Endpoints.org.apply,
    );
    expectApiGetSuccess(result.status, result.body);
  });
});
