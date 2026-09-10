import { test, loggedGet, loggedPost, Endpoints } from '@shared';
import {
  annotateScenarioApis,
  buildNoticeSettingsPayload,
  buildOrgBackgroundPayload,
  expectApiGetSuccess,
  expectApiWriteSuccess,
  resolveGalleryImages,
} from '@shared';

test.describe('修改组织背景图 @batch6', () => {
  test('换组织背景 @batch6', async ({ api, env }) => {
    annotateScenarioApis('修改组织背景图');
    test.skip(!env.orgId, '未配置 TEST_ORG_ID');

    const media = await resolveGalleryImages(api);
    const patch = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '修改组织背景图' },
      Endpoints.org.background(env.orgId),
      buildOrgBackgroundPayload(media.backgroundUrl || media.coverUrl),
    );
    expectApiWriteSuccess(patch.status, patch.body);
  });
});

test.describe('通知设置-修改 @batch6', () => {
  test('读通知设置 → 修改 @batch6', async ({ api, env }) => {
    annotateScenarioApis('通知设置-修改');

    const current = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '通知设置' },
      Endpoints.user.settingsNotice,
    );
    expectApiGetSuccess(current.status, current.body);

    const patch = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '修改通知设置' },
      Endpoints.user.settingsNotice,
      buildNoticeSettingsPayload({ dynamic_star_notice: 0 }),
    );
    expectApiWriteSuccess(patch.status, patch.body);
  });
});
