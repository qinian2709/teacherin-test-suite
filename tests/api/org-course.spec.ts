import { test, loggedGet, loggedPost, Endpoints } from '@shared';
import {
  annotateScenarioApis,
  buildAddLicenseRepoPayload,
  buildChangeBackgroundPayload,
  buildCreateFromTemplatePayload,
  buildCreateUserLicensePayload,
  buildImportToOrgPayload,
  buildPublishPayload,
  buildSaveTemplatePayload,
  deleteCourse,
  deletePublishedOrgCourse,
  expectApiGetSuccess,
  expectApiWriteSuccess,
  fetchCovers,
  pickLicenseId,
  pickNumericId,
  provisionOrgCourse,
  provisionOrgPublishedCourse,
  provisionPersonalCourse,
  resolveGalleryImages,
  resolveTemplateIdAfterSave,
  resolveUserByPhone,
} from '@shared';

test.describe('组织空间：创建课程+保存模板+模板创建课程+删除模板+删除课程 @batch3', () => {
  test('组织建课 → 存模板 → 查模板/详情 @batch3', async ({ api, env, data }) => {
    annotateScenarioApis('组织空间：创建课程+保存模板+模板创建课程+删除模板+删除课程');
    test.skip(!env.orgId, '未配置 TEST_ORG_ID');
    await fetchCovers(api, test.info(), env.apiBaseURL);
    const course = await provisionOrgCourse(api, data, env.orgId);

    const templates = await loggedGet(
      api,
      {
        testInfo: test.info(),
        apiBaseURL: env.apiBaseURL,
        logName: '组织模板列表',
        maxDurationMs: 0,
      },
      Endpoints.org.authTemplates(env.orgId),
    );
    expectApiGetSuccess(templates.status, templates.body);

    const saveTpl = await loggedPost(
      api,
      {
        testInfo: test.info(),
        apiBaseURL: env.apiBaseURL,
        logName: '课程存模板',
        maxDurationMs: 0,
      },
      Endpoints.repo.template(course.repoId),
      buildSaveTemplatePayload(undefined, env.orgId),
    );
    expectApiWriteSuccess(saveTpl.status, saveTpl.body);

    const exist = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '课程详情' },
      Endpoints.repo.exist(course.repoId),
    );
    expectApiGetSuccess(exist.status, exist.body);
  });

  test('模板建课 → 删模板 @batch4', async ({ api, env, data }) => {
    annotateScenarioApis('组织空间：创建课程+保存模板+模板创建课程+删除模板+删除课程');
    test.skip(!env.orgId, '未配置 TEST_ORG_ID');
    await fetchCovers(api, test.info(), env.apiBaseURL);
    const course = await provisionOrgCourse(api, data, env.orgId);
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
      buildSaveTemplatePayload(templateName, env.orgId),
    );
    expectApiWriteSuccess(saveTpl.status, saveTpl.body);
    const templateId = await resolveTemplateIdAfterSave(
      api,
      Endpoints.org.authTemplates(env.orgId),
      templateName,
    );

    const fromTpl = await loggedPost(
      api,
      {
        testInfo: test.info(),
        apiBaseURL: env.apiBaseURL,
        logName: '模板建课',
        maxDurationMs: 0,
      },
      Endpoints.repo.createOrg(env.orgId),
      buildCreateFromTemplatePayload(templateId),
    );
    expectApiWriteSuccess(fromTpl.status, fromTpl.body);
    const tplCourseId = pickNumericId(fromTpl.body);
    if (tplCourseId) {
      data.register(`delete-org-tpl-course-${tplCourseId}`, async () => {
        await deleteCourse(api, tplCourseId);
      });
    }

    const deleted = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '删除模版' },
      Endpoints.repo.templateDelete(templateId),
      {},
    );
    expectApiWriteSuccess(deleted.status, deleted.body);
  });
});

test.describe('获取课程封面-创建组织课程-修改背景--删除 @batch3', () => {
  test('组织建课 → 改背景 → 查详情 @batch3', async ({ api, env, data }) => {
    annotateScenarioApis('获取课程封面-创建组织课程-修改背景--删除');
    test.skip(!env.orgId, '未配置 TEST_ORG_ID');
    await fetchCovers(api, test.info(), env.apiBaseURL);
    const course = await provisionOrgCourse(api, data, env.orgId);
    const media = await resolveGalleryImages(api);

    const bg = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '更换课程背景' },
      Endpoints.repo.background(course.repoId),
      buildChangeBackgroundPayload(media.backgroundUrl),
    );
    expectApiWriteSuccess(bg.status, bg.body);

    const detail = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '仓库详情' },
      Endpoints.repo.detail(course.repoId),
    );
    expectApiGetSuccess(detail.status, detail.body);
  });
});

test.describe('组织数据相关 @batch3', () => {
  test('组织建课 → 拉统计 @batch3', async ({ api, env, data }) => {
    annotateScenarioApis('组织数据相关');
    test.skip(!env.orgId, '未配置 TEST_ORG_ID');
    await fetchCovers(api, test.info(), env.apiBaseURL);
    await provisionOrgPublishedCourse(api, data, env.orgId);

    for (const path of [
      Endpoints.org.statRepo(env.orgId),
      Endpoints.org.statMember(env.orgId),
      Endpoints.org.statCap(env.orgId),
      Endpoints.org.newRepo(env.orgId, 7),
      Endpoints.org.newRepo(env.orgId, 30),
      Endpoints.org.membersCount(env.orgId),
    ]) {
      const result = await loggedGet(
        api,
        { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: path },
        path,
      );
      expectApiGetSuccess(result.status, result.body);
    }
  });
});

test.describe('组织-导入个人空间课程-删除 @batch3', () => {
  test('先建个人课，再查可导入列表 @batch3', async ({ api, env, data }) => {
    annotateScenarioApis('组织-导入个人空间课程-删除');
    test.skip(!env.orgId, '未配置 TEST_ORG_ID');
    await fetchCovers(api, test.info(), env.apiBaseURL);
    await provisionPersonalCourse(api, data);

    const importList = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '可导入个人课程列表' },
      Endpoints.user.repos,
      { query: { page: 1, limit: 10 } },
    );
    expectApiGetSuccess(importList.status, importList.body);
  });

  test('导入组织公共区 → 查列表 @batch4', async ({ api, env, data }) => {
    annotateScenarioApis('组织-导入个人空间课程-删除');
    test.skip(!env.orgId, '未配置 TEST_ORG_ID');
    await fetchCovers(api, test.info(), env.apiBaseURL);
    const personal = await provisionPersonalCourse(api, data);

    const imported = await loggedPost(
      api,
      {
        testInfo: test.info(),
        apiBaseURL: env.apiBaseURL,
        logName: '导入到组织',
        maxDurationMs: 0,
      },
      Endpoints.repo.importToOrg(personal.repoId, env.orgId),
      buildImportToOrgPayload(),
    );
    expectApiWriteSuccess(imported.status, imported.body);

    const orgRepos = await loggedGet(
      api,
      {
        testInfo: test.info(),
        apiBaseURL: env.apiBaseURL,
        logName: '组织公共区课程',
        maxDurationMs: 0,
      },
      Endpoints.org.authRepos(env.orgId),
      { query: { page: 1, limit: 20 } },
    );
    expectApiGetSuccess(orgRepos.status, orgRepos.body);
  });
});

test.describe('组织课程授权给个人 @batch5', () => {
  test('建课 → 添加买家 → 授权课程 → 删除买家 @batch5', async ({ api, env, data }) => {
    annotateScenarioApis('组织课程授权给个人');
    test.skip(!env.orgId, '未配置 TEST_ORG_ID');
    test.skip(!env.invitePhone, '未配置 TEST_INVITE_PHONE');

    await fetchCovers(api, test.info(), env.apiBaseURL);
    const course = await provisionOrgCourse(api, data, env.orgId);
    const inviteUser = await resolveUserByPhone(api, env.invitePhone, env.inviteNationCode);

    const me = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '当前用户' },
      Endpoints.user.current,
    );
    expectApiGetSuccess(me.status, me.body);

    const listBefore = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '买家列表(前)' },
      Endpoints.org.license(env.orgId),
      { query: { page: 1, limit: 20, user_type: 0 } },
    );
    expectApiGetSuccess(listBefore.status, listBefore.body);
    let licenseId =
      pickLicenseId(listBefore.body, { licenseeId: inviteUser.userId }) ??
      pickLicenseId(listBefore.body, { phone: env.invitePhone });

    if (!licenseId) {
      const addLicensee = await loggedPost(
        api,
        {
          testInfo: test.info(),
          apiBaseURL: env.apiBaseURL,
          logName: '添加被授权个人',
          maxDurationMs: 0,
        },
        Endpoints.org.license(env.orgId),
        buildCreateUserLicensePayload(env.invitePhone, inviteUser.username),
      );
      const addCode =
        typeof addLicensee.body === 'object' &&
        addLicensee.body !== null &&
        'code' in addLicensee.body
          ? (addLicensee.body as { code: number }).code
          : undefined;
      if (addCode !== 0 && addCode !== 10016) {
        expectApiWriteSuccess(addLicensee.status, addLicensee.body);
      }

      const licenseList = await loggedGet(
        api,
        { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '买家列表' },
        Endpoints.org.license(env.orgId),
        { query: { page: 1, limit: 20, user_type: 0 } },
      );
      expectApiGetSuccess(licenseList.status, licenseList.body);
      licenseId =
        pickLicenseId(licenseList.body, { licenseeId: inviteUser.userId }) ??
        pickLicenseId(licenseList.body, { phone: env.invitePhone });
    }
    if (!licenseId) throw new Error('买家列表无 license id');

    data.register(`delete-org-license-${env.orgId}-${licenseId}`, async () => {
      await api.post(Endpoints.org.licenseDelete(env.orgId, licenseId), {}, { maxDurationMs: 0 });
    });

    const authRepos = await loggedGet(
      api,
      {
        testInfo: test.info(),
        apiBaseURL: env.apiBaseURL,
        logName: '待授权课程',
        maxDurationMs: 0,
      },
      Endpoints.org.authRepos(env.orgId),
      { query: { page: 1, limit: 20 } },
    );
    expectApiGetSuccess(authRepos.status, authRepos.body);

    const grant = await loggedPost(
      api,
      {
        testInfo: test.info(),
        apiBaseURL: env.apiBaseURL,
        logName: '授权课程',
        maxDurationMs: 0,
      },
      Endpoints.org.licenseRepos(env.orgId),
      buildAddLicenseRepoPayload(inviteUser.userId, course.repoId),
    );
    expectApiWriteSuccess(grant.status, grant.body);
  });
});

test.describe('管理员操作课程 @batch5', () => {
  test('exist → permissions → publish → cancel @batch5', async ({ api, env, data }) => {
    annotateScenarioApis('管理员操作课程');
    test.skip(!env.orgId, '未配置 TEST_ORG_ID');

    await fetchCovers(api, test.info(), env.apiBaseURL);
    const course = await provisionOrgCourse(api, data, env.orgId);
    const media = await resolveGalleryImages(api);

    const exist = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '课程 exist' },
      Endpoints.repo.exist(course.repoId),
    );
    expectApiGetSuccess(exist.status, exist.body);

    const permissions = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '管理员权限' },
      Endpoints.repo.adminPermissions(course.repoId),
    );
    expectApiGetSuccess(permissions.status, permissions.body);

    const publish = await loggedPost(
      api,
      {
        testInfo: test.info(),
        apiBaseURL: env.apiBaseURL,
        logName: '管理员发布',
        maxDurationMs: 0,
      },
      Endpoints.repo.adminPublish(course.repoId),
      buildPublishPayload(course.name, media.coverUrl),
    );
    expectApiWriteSuccess(publish.status, publish.body);

    data.register(`admin-delete-org-course-${course.repoId}`, async () => {
      await deletePublishedOrgCourse(api, course.repoId);
    });

    const cancel = await loggedPost(
      api,
      {
        testInfo: test.info(),
        apiBaseURL: env.apiBaseURL,
        logName: '取消发布',
        maxDurationMs: 0,
      },
      Endpoints.repo.adminPublishCancel(course.repoId),
      {},
    );
    expectApiWriteSuccess(cancel.status, cancel.body);
  });
});
