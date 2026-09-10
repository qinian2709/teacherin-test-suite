import { test, loggedGet, Endpoints } from '@shared';
import {
  annotateScenarioApis,
  expectApiGetSuccess,
  fetchCovers,
  provisionPersonalCourse,
} from '@shared';

test.describe('协作页加载流程 @batch6', () => {
  test('权限 → 评分列表 → 共建列表 → 贡献列表 @batch6', async ({ api, env, data }) => {
    annotateScenarioApis('协作页加载流程');
    await fetchCovers(api, test.info(), env.apiBaseURL);
    const course = await provisionPersonalCourse(api, data);

    const permissions = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '协作页-课程权限' },
      Endpoints.repo.permissions(course.repoId),
    );
    expectApiGetSuccess(permissions.status, permissions.body);

    const scores = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '评分方案列表' },
      Endpoints.repo.scoreList(course.repoId),
    );
    expectApiGetSuccess(scores.status, scores.body);

    const contributors = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '协作页-共建列表' },
      Endpoints.repo.contributors(course.repoId),
    );
    expectApiGetSuccess(contributors.status, contributors.body);

    const pulls = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '收到的贡献列表' },
      Endpoints.repo.pulls(course.repoId),
      { query: { page: 1, limit: 10 } },
    );
    expectApiGetSuccess(pulls.status, pulls.body);
  });
});
