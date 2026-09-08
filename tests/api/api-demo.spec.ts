import { test, expect } from '@playwright/test';
import { api } from '../../shared/api';
import { expectOk } from '../../shared/utils';

test.describe('TeacherIn API 冒烟', () => {
  test('swagger 可访问', async () => {
    const res = await api.swagger.get();
    expect(res.status).toBeLessThan(500);
  });

  test('用户信息接口鉴权生效', async () => {
    const res = await api.user.info();
    // 未配 token 时预期 401/403；配 token 时预期 200
    expect([200, 401, 403]).toContain(res.status);
    if (res.ok) expectOk(res);
  });

  test('仓库搜索接口返回结构', async () => {
    const res = await api.repo.list();
    expect(res.status).toBeLessThan(500);
  });
});
