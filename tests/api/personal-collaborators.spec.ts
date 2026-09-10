import { test, loggedGet, loggedPost, Endpoints } from '@shared';
import {
  annotateScenarioApis,
  buildAddCollaboratorsPayload,
  buildCollaboratorPatchPayload,
  expectApiGetSuccess,
  expectApiWriteSuccess,
  fetchCovers,
  provisionPersonalCourse,
  resolveUserByPhone,
} from '@shared';

test.describe(
  '创建个人课程-搜索用户-添加协作者-查看协作者列表-修改协作者权限-删除协作者-删除课程 @batch5',
  () => {
    test('建课 → 搜用户 → 加协作者 → 改权限 → 删协作者 @batch5', async ({ api, env, data }) => {
      annotateScenarioApis(
        '创建个人课程-搜索用户-添加协作者-查看协作者列表-修改协作者权限-删除协作者-删除课程',
      );
      test.skip(!env.invitePhone, '未配置 TEST_INVITE_PHONE');

      await fetchCovers(api, test.info(), env.apiBaseURL);
      const course = await provisionPersonalCourse(api, data);
      const collaborator = await resolveUserByPhone(api, env.invitePhone, env.inviteNationCode);

      const search = await loggedGet(
        api,
        { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '协作邀请用户搜索' },
        Endpoints.repo.inviteUsersSearch(course.repoId),
        { query: { q: env.invitePhone, page: 1, limit: 10 } },
      );
      expectApiGetSuccess(search.status, search.body);

      const add = await loggedPost(
        api,
        { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '添加协作者' },
        Endpoints.repo.collaboratorsPut(course.repoId),
        buildAddCollaboratorsPayload(collaborator.userId, 11),
      );
      expectApiWriteSuccess(add.status, add.body);

      const list = await loggedGet(
        api,
        { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '协作者列表' },
        Endpoints.repo.collaborators(course.repoId),
        { query: { page: 1, limit: 20 } },
      );
      expectApiGetSuccess(list.status, list.body);

      const patch = await loggedPost(
        api,
        { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '修改协作者权限' },
        Endpoints.repo.collaboratorPatch(course.repoId, collaborator.userId),
        buildCollaboratorPatchPayload(10),
      );
      expectApiWriteSuccess(patch.status, patch.body);

      const removed = await loggedPost(
        api,
        { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '删除协作者' },
        Endpoints.repo.collaboratorDelete(course.repoId, collaborator.userId),
        {},
      );
      expectApiWriteSuccess(removed.status, removed.body);
    });
  },
);
