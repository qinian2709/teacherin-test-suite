import { test, loggedGet, loggedPost, Endpoints } from '@shared';
import {
  annotateScenarioApis,
  buildBatchGetFilePermissionPayload,
  buildCosApplyBatchPayload,
  buildCosBatchPayload,
  buildDownloadFilePayload,
  buildRepoContentsPayload,
  buildSetFilePermissionPayload,
  expectApiGetSuccess,
  expectApiWriteSuccess,
  fetchCovers,
  pickCloudSearchKeyword,
  pickFirstRepoFullPath,
  provisionPersonalCourse,
  resolveImportableCloudFile,
} from '@shared';

test.describe('设置文件下载状态-下载文件 @batch8', () => {
  test('云盘导入 → 另存 → 下载 → 改权限 @batch8', async ({ api, env, data }) => {
    annotateScenarioApis('设置文件下载状态-下载文件');
    await fetchCovers(api, test.info(), env.apiBaseURL);

    const sourceCourse = await provisionPersonalCourse(api, data);
    const targetCourse = await provisionPersonalCourse(api, data);

    const cloudFile = await resolveImportableCloudFile(api);
    if (!cloudFile) {
      test.skip(true, '云盘无可用文件，跳过下载/权限闭环');
    }

    const importFiles = await loggedPost(
      api,
      {
        testInfo: test.info(),
        apiBaseURL: env.apiBaseURL,
        logName: '云盘导入源课程',
        maxDurationMs: 0,
      },
      Endpoints.repo.cosBatch(sourceCourse.repoId),
      buildCosBatchPayload(cloudFile!),
    );
    expectApiWriteSuccess(importFiles.status, importFiles.body);

    const sourceContents = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '源课程文件列表' },
      Endpoints.repo.contents(sourceCourse.repoId),
      buildRepoContentsPayload(''),
    );
    expectApiWriteSuccess(sourceContents.status, sourceContents.body);
    const sourceFullPath = pickFirstRepoFullPath(sourceContents.body);
    if (!sourceFullPath) throw new Error('源课程 contents 无 full_path');

    const apply = await loggedPost(
      api,
      {
        testInfo: test.info(),
        apiBaseURL: env.apiBaseURL,
        logName: '另存至目标课程',
        maxDurationMs: 0,
      },
      Endpoints.repo.cosApplyBatch(targetCourse.repoId),
      buildCosApplyBatchPayload(sourceCourse.repoId, [sourceFullPath]),
    );
    expectApiWriteSuccess(apply.status, apply.body);

    const searchKw = pickCloudSearchKeyword(cloudFile!.fileName) ?? sourceFullPath.split('/').pop() ?? '';
    if (searchKw) {
      const fileSearch = await loggedGet(
        api,
        { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '课程内搜文件' },
        Endpoints.repo.files(sourceCourse.repoId),
        { query: { q: searchKw, page: 1, limit: 10 } },
      );
      expectApiGetSuccess(fileSearch.status, fileSearch.body);
    }

    const contents = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '源课程文件列表(下载)' },
      Endpoints.repo.contents(sourceCourse.repoId),
      buildRepoContentsPayload(''),
    );
    expectApiWriteSuccess(contents.status, contents.body);
    const permissionPath = pickFirstRepoFullPath(contents.body) ?? sourceFullPath;
    const downloadPath = permissionPath;

    const setPerm = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '设置下载权限' },
      Endpoints.repo.permissionsFiles(sourceCourse.repoId),
      buildSetFilePermissionPayload([permissionPath], 0),
    );
    expectApiWriteSuccess(setPerm.status, setPerm.body);

    const download = await loggedPost(
      api,
      {
        testInfo: test.info(),
        apiBaseURL: env.apiBaseURL,
        logName: '下载文件',
        maxDurationMs: 0,
      },
      Endpoints.repo.download(sourceCourse.repoId),
      buildDownloadFilePayload(downloadPath),
    );
    expectApiWriteSuccess(download.status, download.body);

    const batchPerm = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '批量查下载权限' },
      Endpoints.repo.permissionsBatch(sourceCourse.repoId),
      buildBatchGetFilePermissionPayload([permissionPath]),
    );
    expectApiWriteSuccess(batchPerm.status, batchPerm.body);
  });
});
