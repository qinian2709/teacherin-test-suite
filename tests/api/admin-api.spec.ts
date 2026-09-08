import { test, expect } from '@playwright/test';
import { adminApi } from '../../shared/api';

test.describe('TeacherIn 管理后台 API 冒烟（go-admin / zxjs）', () => {
  test('管理后台 swagger 可访问', async () => {
    const res = await adminApi.swagger.get();
    expect(res.status).toBeLessThan(500);
  });

  test('管理后台 misc 接口可达', async () => {
    const res = await adminApi.misc.ping();
    expect(res.status).toBeLessThan(500);
  });
});
