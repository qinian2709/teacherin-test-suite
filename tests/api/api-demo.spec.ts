import { test, expect, loggedGet, Endpoints } from '@shared';

/**
 * TeacherIn 主站冒烟：对照 teacherin-go-git
 * GET /repos/search（routers/api/v1/search/repo_search.go）
 */
test.describe('TeacherIn API 冒烟 @smoke', () => {
  test('GET /repos/search 仓库搜索可访问', async ({ anonApi, env }) => {
    const { status, body, durationMs } = await loggedGet(anonApi, {
      testInfo: test.info(),
      apiBaseURL: env.apiBaseURL,
      logName: 'GET /repos/search',
      assertions: ['HTTP 状态码应 < 500', '响应体应为 JSON'],
    }, Endpoints.repo.search, {
      query: { q: '', s: 'views', limit: 1 },
    });

    expect(status, '仓库搜索不应 5xx').toBeLessThan(500);
    expect(body, '应返回 JSON').toBeTruthy();

    test.info().annotations.push({
      type: 'smoke',
      description: `${env.apiBaseURL}${Endpoints.repo.search} -> HTTP ${status} (${durationMs}ms)`,
    });
  });
});
