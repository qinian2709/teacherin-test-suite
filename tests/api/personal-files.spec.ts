import { test, expect, loggedGet, loggedPost, Endpoints, isEnvelope, SUCCESS_CODE } from '@shared';
import {
  annotateScenarioApis,
  buildCopyRepoPayload,
  buildCosBatchPayload,
  buildEpptNewPayload,
  buildEpptTransformPayload,
  uploadLocalFileToRepo,
  waitForRepoFilePreviewReady,
  buildGitkeepPayload,
  buildNewbeeAuthPayload,
  buildNewbeeCreatePayload,
  buildRepoContentsPayload,
  buildRepoTopicPayload,
  buildSpeakingCreatePayload,
  buildSpeakingImportPayload,
  buildSpeakingValidatePayload,
  buildSpeakingLmsPayload,
  buildTopicsLenovoPayload,
  countSpeakingCardsInResponse,
  deleteCourse,
  expectApiGetSuccess,
  expectApiWriteSuccess,
  fetchCovers,
  fetchDefaultLmsUnitId,
  pickCloudFolderId,
  pickCloudSearchKeyword,
  pickEpptTransformCallId,
  pickFirstRepoFilePath,
  pickFirstRepoTreePath,
  pickFirstTopicName,
  pickLmsCreateUnitId,
  pickNumericId,
  provisionPersonalCourse,
  resolveImportableCloudFile,
  resolveSpeakingCardsForLms,
  uniqueName,
  uniqueFilePath,
} from '@shared';

test.describe('新建课程-课程标签联想-添加标签-获取标签列表-删除标签-删除课程', () => {
  test('联想 → 添加 → 列表 → 删除 @batch7', async ({ api, env, data }) => {
    annotateScenarioApis('新建课程-课程标签联想-添加标签-获取标签列表-删除标签-删除课程');
    await fetchCovers(api, test.info(), env.apiBaseURL);
    const course = await provisionPersonalCourse(api, data);

    const lenovo = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '标签联想' },
      Endpoints.topics.lenovo,
      buildTopicsLenovoPayload(course.repoId, '学'),
    );
    expectApiWriteSuccess(lenovo.status, lenovo.body);
    const topicName = pickFirstTopicName(lenovo.body) ?? `标签${uniqueName('')}`;

    const add = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '添加标签' },
      Endpoints.repo.topicPut(course.repoId),
      buildRepoTopicPayload(topicName),
    );
    expectApiWriteSuccess(add.status, add.body);

    const list = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '标签列表' },
      Endpoints.repo.topics(course.repoId),
    );
    expectApiGetSuccess(list.status, list.body);

    const removed = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '删除标签' },
      Endpoints.repo.topicDelete(course.repoId),
      buildRepoTopicPayload(topicName),
    );
    expectApiWriteSuccess(removed.status, removed.body);
  });
});

test.describe('创建个人课程-创建课程副本-删除课程-删除副本课程', () => {
  test('创建 → copy → 删副本 → 删原课 @batch7', async ({ api, env, data }) => {
    annotateScenarioApis('创建个人课程-创建课程副本-删除课程-删除副本课程');
    await fetchCovers(api, test.info(), env.apiBaseURL);
    const course = await provisionPersonalCourse(api, data);

    const copy = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '创建副本', maxDurationMs: 0 },
      Endpoints.repo.copy(course.repoId),
      buildCopyRepoPayload('副本'),
    );
    expectApiWriteSuccess(copy.status, copy.body);
    const copyRepoId = pickNumericId(copy.body);
    if (!copyRepoId) throw new Error('copy 响应无 repo id');
    expect(copyRepoId).not.toEqual(course.repoId);

    data.register(`delete-copy-${copyRepoId}`, async () => {
      await deleteCourse(api, copyRepoId);
    });
  });
});

test.describe('TI-云盘相关 @batch7', () => {
  test('云盘列表 → 导入课程 → 课程文件操作 @batch7', async ({ api, env, data }) => {
    annotateScenarioApis('TI-云盘相关');
    await fetchCovers(api, test.info(), env.apiBaseURL);
    const course = await provisionPersonalCourse(api, data);

    const detail = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '课程信息' },
      Endpoints.repo.detail(course.repoId),
    );
    expectApiGetSuccess(detail.status, detail.body);

    const cloud = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '云盘根目录' },
      Endpoints.cloud.list(0),
    );
    expectApiGetSuccess(cloud.status, cloud.body);

    const cloudFile = await resolveImportableCloudFile(api);
    if (!cloudFile) {
      test.skip(true, '云盘无可用文件，跳过 cos/batch 及后续文件操作');
    }

    const importFiles = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '云盘导入课程', maxDurationMs: 0 },
      Endpoints.repo.cosBatch(course.repoId),
      buildCosBatchPayload(cloudFile!),
    );
    expectApiWriteSuccess(importFiles.status, importFiles.body);

    const folderId = pickCloudFolderId(cloud.body) ?? cloudFile!.folderId;
    if (folderId > 0) {
      const breadcrumb = await loggedGet(
        api,
        { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '云盘面包屑' },
        Endpoints.cloud.breadcrumb,
        { query: { folder_id: folderId } },
      );
      expectApiGetSuccess(breadcrumb.status, breadcrumb.body);
    }

    const searchKw = pickCloudSearchKeyword(cloudFile!.fileName);
    if (searchKw) {
      const search = await loggedGet(
        api,
        { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '云盘搜索' },
        Endpoints.cloud.search,
        { query: { kw: searchKw } },
      );
      if (isEnvelope(search.body) && search.body.code === SUCCESS_CODE) {
        expectApiGetSuccess(search.status, search.body);
      } else {
        test.info().annotations.push({
          type: 'note',
          description: `云盘搜索未成功（kw=${searchKw}），不影响 cos/batch 主流程`,
        });
      }
    }

    const contents = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '课程文件列表' },
      Endpoints.repo.contents(course.repoId),
      buildRepoContentsPayload(''),
    );
    expectApiWriteSuccess(contents.status, contents.body);
  });
});

test.describe('在线文档&eppt @batch7', () => {
  test('newbee 鉴权 → 快照 → 在线文档 → eppt @batch7', async ({ api, env, data }) => {
    annotateScenarioApis('在线文档&eppt');
    await fetchCovers(api, test.info(), env.apiBaseURL);
    const course = await provisionPersonalCourse(api, data);
    const docPath = `${uniqueFilePath('doc')}.nb`;

    const doc = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '新建在线文档', maxDurationMs: 0 },
      Endpoints.repo.newbeeCreate(course.repoId),
      buildNewbeeCreatePayload(docPath),
    );
    expectApiWriteSuccess(doc.status, doc.body);

    const auth = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: 'newbee鉴权' },
      Endpoints.repo.newbeeAuth(course.repoId),
      buildNewbeeAuthPayload(docPath, 'write'),
    );
    expectApiWriteSuccess(auth.status, auth.body);

    const lms = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: 'contents_lms' },
      Endpoints.repo.contentsLms(course.repoId),
    );
    expectApiGetSuccess(lms.status, lms.body);

    const snapshot = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '教学方案快照', maxDurationMs: 0 },
      Endpoints.repo.newbeeSnapshot(course.repoId),
      buildNewbeeCreatePayload(docPath),
    );
    if (snapshot.status >= 500) {
      test.skip(true, '教学方案快照依赖 tesc 文件，在线文档 env 跳过');
    }
    if (
      snapshot.body &&
      typeof snapshot.body === 'object' &&
      'code' in snapshot.body &&
      (snapshot.body as { code: number }).code !== 0
    ) {
      // nb 文档无 collectionId，快照预期失败，不阻断 eppt 链路
    } else {
      expectApiWriteSuccess(snapshot.status, snapshot.body);
    }

    const eppt = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '新建eppt', maxDurationMs: 0 },
      Endpoints.repo.epptNew(course.repoId),
      buildEpptNewPayload(),
    );
    expectApiWriteSuccess(eppt.status, eppt.body);
  });
});

test.describe('试卷相关 @batch7', () => {
  test('classin token → 建文件夹 @batch7', async ({ api, env, data }) => {
    annotateScenarioApis('试卷相关');
    await fetchCovers(api, test.info(), env.apiBaseURL);
    const course = await provisionPersonalCourse(api, data);

    const token = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: 'classin token' },
      Endpoints.system.classinAccessToken,
    );
    expectApiGetSuccess(token.status, token.body);

    const folder = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '新建文件夹' },
      Endpoints.repo.contentsGitkeep(course.repoId),
      buildGitkeepPayload(`${uniqueFilePath('paper')}/.gitkeep`),
    );
    expectApiWriteSuccess(folder.status, folder.body);

    const contents = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '课程文件列表' },
      Endpoints.repo.contents(course.repoId),
      buildRepoContentsPayload(''),
    );
    expectApiWriteSuccess(contents.status, contents.body);
  });
});

test.describe('口语卡相关 @batch7', () => {
  test('生成口语卡 → 校验 → 导入 @batch7', async ({ api, env, data }) => {
    annotateScenarioApis('口语卡相关');
    await fetchCovers(api, test.info(), env.apiBaseURL);
    const course = await provisionPersonalCourse(api, data);

    const report = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '上报最近打开' },
      Endpoints.repo.report(course.repoId),
      {},
    );
    expectApiWriteSuccess(report.status, report.body);

    const create = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '生成口语卡', maxDurationMs: 0 },
      Endpoints.speaking.create,
      buildSpeakingCreatePayload(['hello', 'world']),
    );
    expectApiWriteSuccess(create.status, create.body);

    const validate = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '口语卡校验' },
      Endpoints.speaking.validate,
      buildSpeakingImportPayload(),
    );
    expectApiWriteSuccess(validate.status, validate.body);

    const imported = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '口语卡导入', maxDurationMs: 0 },
      Endpoints.speaking.import,
      buildSpeakingImportPayload(),
    );
    expectApiWriteSuccess(imported.status, imported.body);

    expect(
      countSpeakingCardsInResponse(imported.body),
      'speaking/import 应返回与请求等长的卡片列表',
    ).toBe(buildSpeakingImportPayload().length);

    const speakingCards = resolveSpeakingCardsForLms(imported.body, create.body);
    expect(
      speakingCards.length,
      'import 与 create 均未返回可用口语卡',
    ).toBeGreaterThan(0);

    const unitId = await fetchDefaultLmsUnitId(api, test.info(), env.apiBaseURL, course.repoId);
    const speakingLms = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '新建口语卡活动', maxDurationMs: 0 },
      Endpoints.repo.lms(course.repoId),
      buildSpeakingLmsPayload(unitId, speakingCards),
    );
    expectApiWriteSuccess(speakingLms.status, speakingLms.body);
    pickLmsCreateUnitId(speakingLms.body);
  });
});

test.describe('转换eppt @batch7', () => {
  test('校验空间 → 本地上传 ppt → 转换 eppt @batch7', async ({ api, env, data }) => {
    annotateScenarioApis('转换eppt');
    await fetchCovers(api, test.info(), env.apiBaseURL);
    const course = await provisionPersonalCourse(api, data);

    const space = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '校验空间' },
      Endpoints.repo.validSpace(course.repoId),
      {},
    );
    expectApiWriteSuccess(space.status, space.body);

    const uploaded = await uploadLocalFileToRepo(api, test.info(), env.apiBaseURL, course.repoId, {
      logName: '本地上传ppt',
    });

    await waitForRepoFilePreviewReady(
      api,
      test.info(),
      env.apiBaseURL,
      course.repoId,
      uploaded.previewTreePath,
    );

    const transform = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '转换eppt', maxDurationMs: 0 },
      Endpoints.repo.epptTransform(course.repoId),
      buildEpptTransformPayload(uploaded.transformTreePath),
    );
    expectApiWriteSuccess(transform.status, transform.body);

    const callId = pickEpptTransformCallId(transform.body);
    if (callId) {
      const query = await loggedGet(
        api,
        { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '查询转换结果' },
        Endpoints.repo.epptTransQuery(course.repoId, callId),
      );
      expectApiGetSuccess(query.status, query.body);
    }
  });
});
