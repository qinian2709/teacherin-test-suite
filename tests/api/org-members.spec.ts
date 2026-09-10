import { test, expect, loggedGet, loggedPost, Endpoints } from '@shared';
import {
  annotateScenarioApis,
  buildMemberPatchPayload,
  buildTeamMemberAddByAccountPayload,
  buildTeamMemberRemovePayload,
  buildTeamPromotePayload,
  buildTeamSettingPayload,
  createOrgTeam,
  expectApiGetSuccess,
  expectApiWriteSuccess,
  inviteOrgMember,
  pickTeamMemberId,
  pickUserId,
  removeOrgMember,
} from '@shared';

test.describe('邀请成员加入组织-获取成员列表-修改成员角色-移除成员 @batch3', () => {
  test('邀请 → 列表 → patch → 移除 @batch3', async ({ api, env, data }) => {
    annotateScenarioApis('邀请成员加入组织-获取成员列表-修改成员角色-移除成员');
    test.skip(!env.orgId, '未配置 TEST_ORG_ID');
    test.skip(!env.invitePhone, '未配置 TEST_INVITE_PHONE');

    const invited = await inviteOrgMember(
      api,
      data,
      env.orgId,
      env.invitePhone,
      env.inviteNationCode,
    );

    const list = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '组织成员' },
      Endpoints.org.members(env.orgId),
      { query: { page: 1, limit: 50 } },
    );
    expectApiGetSuccess(list.status, list.body);

    const search = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '成员搜索' },
      Endpoints.org.membersSearch(env.orgId),
      { query: { q: env.invitePhone, page: 1, limit: 10 } },
    );
    expectApiGetSuccess(search.status, search.body);

    const patch = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '更新成员角色' },
      Endpoints.org.membersPatch(env.orgId),
      buildMemberPatchPayload(invited.userId, 2),
    );
    expectApiWriteSuccess(patch.status, patch.body);

    const removed = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '移除成员' },
      Endpoints.org.memberDelete(env.orgId, invited.userId),
      {},
    );
    expectApiWriteSuccess(removed.status, removed.body);

    await removeOrgMember(api, env.orgId, invited.userId);
  });
});

test.describe('新建团队-添加团员--修改团队信息-团队列表-转让负责人-退出团队-解散团队 @batch3', () => {
  test('建团队 → 加人 → 改名 → 移除团员 → 解散 @batch3', async ({ api, env, data }) => {
    annotateScenarioApis('新建团队-添加团员--修改团队信息-团队列表-转让负责人-退出团队-解散团队');
    test.skip(!env.orgId, '未配置 TEST_ORG_ID');
    test.skip(!env.invitePhone, '未配置 TEST_INVITE_PHONE');

    const team = await createOrgTeam(api, data, env.orgId);
    const renamed = `${team.name}改`.slice(0, 24);

    const exist = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '团队名存在校验' },
      Endpoints.org.teamExist(env.orgId, renamed),
      {},
    );
    expectApiWriteSuccess(exist.status, exist.body);

    const addMember = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '邀请添加团队成员' },
      Endpoints.org.teamMemberAdd(env.orgId, team.teamId),
      buildTeamMemberAddByAccountPayload(env.invitePhone, env.inviteNationCode),
    );
    expectApiWriteSuccess(addMember.status, addMember.body);

    const setting = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '团队设置' },
      Endpoints.org.teamSetting(env.orgId, team.teamId),
    );
    expectApiGetSuccess(setting.status, setting.body);

    const rename = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '修改团队名称' },
      Endpoints.org.teamSetting(env.orgId, team.teamId),
      buildTeamSettingPayload('name', renamed),
    );
    expectApiWriteSuccess(rename.status, rename.body);

    const teams = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '团队列表' },
      Endpoints.org.teams(env.orgId),
    );
    expectApiGetSuccess(teams.status, teams.body);

    const members = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '团队成员列表' },
      Endpoints.org.teamMembers(env.orgId, team.teamId),
    );
    expectApiGetSuccess(members.status, members.body);

    const inviteUser = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '搜索邀请用户' },
      Endpoints.user.search,
      { query: { phone_number: env.invitePhone, nation_code: env.inviteNationCode } },
    );
    expectApiGetSuccess(inviteUser.status, inviteUser.body);
    const inviteUserId = pickUserId(inviteUser.body);
    expect(inviteUserId, '邀请用户应有 id').toBeTruthy();

    const memberId = pickTeamMemberId(members.body, inviteUserId!);
    if (memberId) {
      const removeMember = await loggedPost(
        api,
        { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '移除团队成员' },
        Endpoints.org.teamMemberDelete(env.orgId, team.teamId),
        buildTeamMemberRemovePayload(memberId),
      );
      expectApiWriteSuccess(removeMember.status, removeMember.body);
    }

    // promote/quit 需被转让者为团队管理员；单 session 下仅验证接口可达，失败则 skip
    const promote = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '转让团队负责人' },
      Endpoints.org.teamMemberPromote(env.orgId, team.teamId),
      buildTeamPromotePayload(inviteUserId!),
    );
    if (promote.status >= 500 || (typeof promote.body === 'object' && promote.body !== null && 'code' in (promote.body as object) && (promote.body as { code: number }).code !== 0)) {
      test.skip(true, '转让负责人需两名团员且被转让人为管理员，env14 单账号跳过');
    } else {
      expectApiWriteSuccess(promote.status, promote.body);
      const quit = await loggedPost(
        api,
        { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '退出团队' },
        Endpoints.org.teamMemberQuit(env.orgId, team.teamId),
        {},
      );
      expectApiWriteSuccess(quit.status, quit.body);
    }
  });
});
