import { test, loggedGet, loggedPost, Endpoints } from '@shared';
import {
  annotateScenarioApis,
  buildSaveTemplatePayload,
  buildTemplatePatchPayload,
  expectApiGetSuccess,
  expectApiWriteSuccess,
  fetchCovers,
  provisionPersonalCourse,
  resolveTemplateIdAfterSave,
} from '@shared';

test.describe('验证模版数量-获取个人/平台模版列表-重命名个人模版-删除模版 @batch4', () => {
  test('建课 → 存模板 → 列表 → 重命名 → 删除 @batch4', async ({ api, env, data }) => {
    annotateScenarioApis('验证模版数量-获取个人/平台模版列表-重命名个人模版-删除模版');
    await fetchCovers(api, test.info(), env.apiBaseURL);
    const course = await provisionPersonalCourse(api, data);
    const templateName = `课程模版${Date.now()}`;

    const saveTpl = await loggedPost(
      api,
      {
        testInfo: test.info(),
        apiBaseURL: env.apiBaseURL,
        logName: '课程存模板',
        maxDurationMs: 0,
      },
      Endpoints.repo.template(course.repoId),
      buildSaveTemplatePayload(templateName),
    );
    expectApiWriteSuccess(saveTpl.status, saveTpl.body);
    const templateId = await resolveTemplateIdAfterSave(
      api,
      Endpoints.user.templates,
      templateName,
    );

    data.register(`delete-template-${templateId}`, async () => {
      await api.post(Endpoints.repo.templateDelete(templateId), {}, { maxDurationMs: 0 });
    });

    const count = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '模版数量' },
      Endpoints.user.templateCount,
    );
    expectApiGetSuccess(count.status, count.body);

    const list = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '个人模版列表' },
      Endpoints.user.templates,
      { query: { page: 1, limit: 20 } },
    );
    expectApiGetSuccess(list.status, list.body);

    const rename = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '重命名模版' },
      Endpoints.repo.templatePatch(templateId),
      buildTemplatePatchPayload(),
    );
    expectApiWriteSuccess(rename.status, rename.body);

    const deleted = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '删除模版' },
      Endpoints.repo.templateDelete(templateId),
      {},
    );
    expectApiWriteSuccess(deleted.status, deleted.body);
  });
});
