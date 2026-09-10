import { test, loggedPost, Endpoints } from '@shared';
import {
  annotateScenarioApis,
  buildCreateLmsUnitPayload,
  buildLmsCopyUnitPayload,
  buildLmsDeletePayload,
  buildLmsLockPayload,
  buildLmsMovePayload,
  buildUpdateLmsUnitPayload,
  expectApiWriteSuccess,
  fetchCovers,
  fetchDefaultLmsUnitId,
  pickLmsCreateUnitId,
  provisionPersonalCourse,
} from '@shared';

test.describe('新建单元-编辑单元-加锁释放锁-移动位置-复制单元-删除单元 @batch6', () => {
  test('LMS 单元完整流程 @batch6', async ({ api, env, data }) => {
    annotateScenarioApis('新建单元-编辑单元-加锁释放锁-移动位置-复制单元-删除单元');
    await fetchCovers(api, test.info(), env.apiBaseURL);
    const course = await provisionPersonalCourse(api, data);
    const parentUnitId = await fetchDefaultLmsUnitId(api, test.info(), env.apiBaseURL, course.repoId);

    const create = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '新建单元', maxDurationMs: 0 },
      Endpoints.repo.lms(course.repoId),
      buildCreateLmsUnitPayload(parentUnitId),
    );
    expectApiWriteSuccess(create.status, create.body);
    const newUnitId = pickLmsCreateUnitId(create.body);
    if (!newUnitId) throw new Error('新建单元响应无 unit_id');

    const lock = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '编辑加锁' },
      Endpoints.repo.lmsLock(course.repoId),
      buildLmsLockPayload(newUnitId),
    );
    expectApiWriteSuccess(lock.status, lock.body);

    const update = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '编辑单元', maxDurationMs: 0 },
      Endpoints.repo.lmsPut(course.repoId),
      buildUpdateLmsUnitPayload(newUnitId),
    );
    expectApiWriteSuccess(update.status, update.body);

    const unlock = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '释放锁' },
      Endpoints.repo.lmsLockDelete(course.repoId),
      buildLmsLockPayload(newUnitId),
    );
    expectApiWriteSuccess(unlock.status, unlock.body);

    const move = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '移动单元', maxDurationMs: 0 },
      Endpoints.repo.lmsMove(course.repoId),
      buildLmsMovePayload(newUnitId, parentUnitId),
    );
    expectApiWriteSuccess(move.status, move.body);

    const copy = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '复制单元', maxDurationMs: 0 },
      Endpoints.repo.lmsCopy(course.repoId),
      buildLmsCopyUnitPayload(newUnitId),
    );
    expectApiWriteSuccess(copy.status, copy.body);
    const copiedUnitId = pickLmsCreateUnitId(copy.body) ?? newUnitId;

    const delCopy = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '删除副本单元', maxDurationMs: 0 },
      Endpoints.repo.lmsDelete(course.repoId),
      buildLmsDeletePayload(copiedUnitId),
    );
    expectApiWriteSuccess(delCopy.status, delCopy.body);

    const del = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '删除单元', maxDurationMs: 0 },
      Endpoints.repo.lmsDelete(course.repoId),
      buildLmsDeletePayload(newUnitId),
    );
    expectApiWriteSuccess(del.status, del.body);
  });
});
