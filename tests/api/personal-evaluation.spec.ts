import { test, loggedGet, loggedPost, Endpoints } from '@shared';
import {
  annotateScenarioApis,
  buildCreateCustomScorePayload,
  buildCreateLit2ModelPayload,
  buildDeleteCustomScorePayload,
  buildLit2DetectionPayload,
  buildUpdateCustomScorePayload,
  buildUpdateLit2ModelPayload,
  expectApiGetSuccess,
  expectApiWriteSuccess,
  fetchCovers,
  pickCustomScoreId,
  pickLit2ModelId,
  provisionPersonalCourse,
} from '@shared';

test.describe('新建课程-新建评分方案-编辑评分方案-获取评价方案列表删除评分方案-删除课程 @batch6', () => {
  test('评分方案 CRUD @batch6', async ({ api, env, data }) => {
    annotateScenarioApis(
      '新建课程-新建评分方案-编辑评分方案-获取评价方案列表删除评分方案-删除课程',
    );
    await fetchCovers(api, test.info(), env.apiBaseURL);
    const course = await provisionPersonalCourse(api, data);
    const createPayload = buildCreateCustomScorePayload();
    const scoreName = createPayload.scoreName as string;

    const create = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '新建评分方案', maxDurationMs: 0 },
      Endpoints.repo.scoreCreate(course.repoId),
      createPayload,
    );
    expectApiWriteSuccess(create.status, create.body);

    const list = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '评分方案列表' },
      Endpoints.repo.scoreList(course.repoId),
    );
    expectApiGetSuccess(list.status, list.body);
    const scoreId = pickCustomScoreId(list.body, scoreName) ?? (createPayload.scoreId as string);

    const update = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '修改评分方案', maxDurationMs: 0 },
      Endpoints.repo.scoreUpdate(course.repoId),
      buildUpdateCustomScorePayload(scoreId, scoreName),
    );
    expectApiWriteSuccess(update.status, update.body);

    const removed = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '删除评分方案', maxDurationMs: 0 },
      Endpoints.repo.scoreDelete(course.repoId),
      buildDeleteCustomScorePayload(scoreId),
    );
    expectApiWriteSuccess(removed.status, removed.body);
  });
});

test.describe(
  '新建课程-创建素养量规-更新素养量规-获取素养量规列表-获取模型详情-检查模型是否被引用-删除指定模型-删除课程 @batch6',
  () => {
    test('素养量规 CRUD @batch6', async ({ api, env, data }) => {
      annotateScenarioApis(
        '新建课程-创建素养量规-更新素养量规-获取素养量规列表-获取模型详情-检查模型是否被引用-删除指定模型-删除课程',
      );
      await fetchCovers(api, test.info(), env.apiBaseURL);
      const course = await provisionPersonalCourse(api, data);
      const createPayload = buildCreateLit2ModelPayload();
      const modelName = createPayload.modelName as string;
      const modelIdFromPayload = createPayload.modelId as string;

      const create = await loggedPost(
        api,
        { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '创建素养模型', maxDurationMs: 0 },
        Endpoints.repo.lit2Create(course.repoId),
        createPayload,
      );
      expectApiWriteSuccess(create.status, create.body);

      const list = await loggedGet(
        api,
        { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '素养模型列表' },
        Endpoints.repo.lit2List(course.repoId),
      );
      expectApiGetSuccess(list.status, list.body);
      const modelId = pickLit2ModelId(list.body, modelName) ?? modelIdFromPayload;

      const update = await loggedPost(
        api,
        { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '更新素养模型', maxDurationMs: 0 },
        Endpoints.repo.lit2Update(course.repoId),
        buildUpdateLit2ModelPayload(createPayload),
      );
      expectApiWriteSuccess(update.status, update.body);

      const detail = await loggedGet(
        api,
        { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '素养模型详情' },
        Endpoints.repo.lit2Detail(course.repoId, modelId),
      );
      expectApiGetSuccess(detail.status, detail.body);

      const detection = await loggedPost(
        api,
        { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '检查模型引用' },
        Endpoints.repo.lit2Detection(course.repoId),
        buildLit2DetectionPayload(modelId),
      );
      expectApiWriteSuccess(detection.status, detection.body);

      const removed = await loggedPost(
        api,
        { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '删除素养模型', maxDurationMs: 0 },
        Endpoints.repo.lit2Delete(course.repoId, modelId),
        {},
      );
      expectApiWriteSuccess(removed.status, removed.body);
    });
  },
);
