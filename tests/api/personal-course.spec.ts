import { test, expect, loggedGet, loggedPost, Endpoints } from '@shared';
import {
  annotateScenarioApis,
  buildGitkeepPayload,
  buildRenameRepoPayload,
  buildSaveTemplatePayload,
  createPersonalCourse,
  expectApiGetSuccess,
  expectApiWriteSuccess,
  fetchCovers,
} from '@shared';

test.describe('新建课程-重命名-置顶-保存为模版-删除', () => {
  test('封面 → 创建 → 置顶/取消 → 重命名 → 存模板 → 删除', async ({ api, env, data }) => {
    annotateScenarioApis('新建课程-重命名-置顶-保存为模版-删除');
    await fetchCovers(api, test.info(), env.apiBaseURL);
    const repoId = await createPersonalCourse(api, test.info(), env.apiBaseURL, data);

    const top = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '置顶' },
      Endpoints.user.repoTop(repoId),
      {},
    );
    expectApiWriteSuccess(top.status, top.body);

    const untop = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '取消置顶' },
      Endpoints.user.repoUntop(repoId),
      {},
    );
    expectApiWriteSuccess(untop.status, untop.body);

    const rename = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '重命名' },
      Endpoints.repo.name(repoId),
      buildRenameRepoPayload(),
    );
    expectApiWriteSuccess(rename.status, rename.body);

    const template = await loggedPost(
      api,
      {
        testInfo: test.info(),
        apiBaseURL: env.apiBaseURL,
        logName: '存模板',
        maxDurationMs: 0,
      },
      Endpoints.repo.template(repoId),
      buildSaveTemplatePayload(),
    );
    expectApiWriteSuccess(template.status, template.body);

    const exist = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '课程详情' },
      Endpoints.repo.exist(repoId),
    );
    expectApiGetSuccess(exist.status, exist.body);
  });
});

test.describe('新建课程-新建文件夹-重命名文件夹名-删除课程', () => {
  test('创建课后建 gitkeep 目录', async ({ api, env, data }) => {
    annotateScenarioApis('新建课程-新建文件夹-重命名文件夹名-删除课程');
    await fetchCovers(api, test.info(), env.apiBaseURL);
    const repoId = await createPersonalCourse(api, test.info(), env.apiBaseURL, data);

    const folder = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '新建文件夹' },
      Endpoints.repo.contentsGitkeep(repoId),
      buildGitkeepPayload(),
    );
    expectApiWriteSuccess(folder.status, folder.body);
  });
});

test.describe('历史记录相关', () => {
  test('创建课 → 查提交历史', async ({ api, env, data }) => {
    annotateScenarioApis('历史记录相关');
    await fetchCovers(api, test.info(), env.apiBaseURL);
    const repoId = await createPersonalCourse(api, test.info(), env.apiBaseURL, data);

    const commits = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '历史记录' },
      Endpoints.repo.commits(repoId),
    );
    expectApiGetSuccess(commits.status, commits.body);
  });
});
