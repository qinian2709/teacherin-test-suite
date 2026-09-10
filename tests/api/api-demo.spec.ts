import { test, expect, loggedGet, Endpoints, expectApiGetSuccess } from '@shared';

/**
 * TeacherIn 主站冒烟：对照 teacherin-go-git
 * GET /repos/search（routers/api/v1/search/repo_search.go）
 */
test.describe('TeacherIn API 冒烟 @smoke @batch1', () => {
  test('GET /repos/search 仓库搜索可访问 @batch1', async ({ anonApi, env }) => {
    const { status, body, durationMs } = await loggedGet(anonApi, {
      testInfo: test.info(),
      apiBaseURL: env.apiBaseURL,
      logName: 'GET /repos/search',
      assertions: ['HTTP 200', '业务 code=0（若有信封）'],
      maxDurationMs: 0,
    }, Endpoints.repo.search, {
      query: { q: '', s: 'views', limit: 1 },
    });

    expectApiGetSuccess(status, body);
    expect(body, '应返回 JSON').toBeTruthy();

    test.info().annotations.push({
      type: 'smoke',
      description: `${env.apiBaseURL}${Endpoints.repo.search} -> HTTP ${status} (${durationMs}ms)`,
    });
  });
});
