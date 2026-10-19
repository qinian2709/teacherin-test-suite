import { test, loggedGet, loggedPost, Endpoints } from '@shared';
import {
  annotateScenarioApis,
  buildAddCollaboratorsPayload,
  buildCollaboratorPatchPayload,
  buildShareTeamsPayload,
  expectApiGetSuccess,
  expectApiWriteSuccess,
  fetchCovers,
  inviteOrgMember,
  pickInviteToken,
  provisionOrgCourse,
  resolveUserByPhone,
} from '@shared';

test.describe(
  '组织创建课程-组织成员列表-添加协作者-查看协作者列表-组织空间修改协作者权限-邀请团队协作-查看课程协作者列表-复制邀请链接-删除协作者-删除课程 @batch4',
  () => {
    test('建课 → 邀成员 → 加协作者 → 改权限 → 删协作者 @batch4', async ({ api, env, data }) => {
      annotateScenarioApis(
        '组织创建课程-组织成员列表-添加协作者-查看协作者列表-组织空间修改协作者权限-邀请团队协作-查看课程协作者列表-复制邀请链接-删除协作者-删除课程',
      );
      test.skip(!env.orgId, '未配置 TEST_ORG_ID');
      test.skip(!env.invitePhone, '未配置 TEST_INVITE_PHONE');

      await fetchCovers(api, test.info(), env.apiBaseURL);
      const course = await provisionOrgCourse(api, data, env.orgId);
      await inviteOrgMember(api, data, env.orgId, env.invitePhone, env.inviteNationCode);
      const collaborator = await resolveUserByPhone(api, env.invitePhone, env.inviteNationCode);

      const members = await loggedGet(
        api,
        { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '组织成员搜索' },
        Endpoints.org.membersSearch(env.orgId),
        { query: { q: env.invitePhone, page: 1, limit: 10 } },
      );
      expectApiGetSuccess(members.status, members.body);

      const shareMode = await loggedGet(
        api,
        { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '分享方式' },
        Endpoints.repo.shareMode(course.repoId),
      );
      expectApiGetSuccess(shareMode.status, shareMode.body);

      const add = await loggedPost(
        api,
        { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '添加协作者' },
        Endpoints.repo.collaboratorsPut(course.repoId),
        buildAddCollaboratorsPayload(collaborator.userId, 12),
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
        buildCollaboratorPatchPayload(13),
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

test.describe(
  '组织课程-邀请团队协作-开启链接邀请-复制邀请链接-加入协作者-关闭链接邀请 @batch6',
  () => {
    test('分享团队 → 开邀请 → 取 token → 关邀请 @batch6', async ({ api, env, data }) => {
      annotateScenarioApis(
        '组织创建课程-组织成员列表-添加协作者-查看协作者列表-组织空间修改协作者权限-邀请团队协作-查看课程协作者列表-复制邀请链接-删除协作者-删除课程',
      );
      test.skip(!env.orgId, '未配置 TEST_ORG_ID');
      test.skip(!env.invitePhone, '未配置 TEST_INVITE_PHONE');

      await fetchCovers(api, test.info(), env.apiBaseURL);
      const course = await provisionOrgCourse(api, data, env.orgId);
      await inviteOrgMember(api, data, env.orgId, env.invitePhone, env.inviteNationCode);

      const shareTeams = await loggedPost(
        api,
        { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '邀请团队协作' },
        Endpoints.repo.shareTeams(course.repoId),
        buildShareTeamsPayload([-1], 12),
      );
      expectApiWriteSuccess(shareTeams.status, shareTeams.body);

      const open = await loggedPost(
        api,
        { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '开启链接邀请' },
        Endpoints.repo.inviteOpen(course.repoId),
        {},
      );
      expectApiWriteSuccess(open.status, open.body);

      const tokenRes = await loggedGet(
        api,
        { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '复制邀请链接' },
        Endpoints.repo.inviteToken(course.repoId),
        { query: { role_id: 12 } },
      );
      expectApiGetSuccess(tokenRes.status, tokenRes.body);
      const token = pickInviteToken(tokenRes.body);
      if (!token) throw new Error('invite/token 响应无 token');

      const check = await loggedPost(
        api,
        { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '检查邀请 token' },
        Endpoints.repo.collaboratorsInviteCheck,
        {},
        { query: { token } },
      );
      expectApiWriteSuccess(check.status, check.body);

      const off = await loggedPost(
        api,
        { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '关闭链接邀请' },
        Endpoints.repo.inviteOff(course.repoId),
        {},
      );
      expectApiWriteSuccess(off.status, off.body);
    });
  },
);
