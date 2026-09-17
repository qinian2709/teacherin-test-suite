import {
  test,
  loggedGet,
  loggedPost,
  Endpoints,
  annotateScenarioApis,
  expectApiGetSuccess,
  expectApiWriteSuccess,
  ensureRepoInDistribution,
  fetchCovers,
  pickDistributionRepoId,
  provisionMerchantPublishedCourse,
  resolveMerchantEntityId,
  buildCreateUserLicensePayload,
  buildAddLicenseRepoPayload,
  pickLicenseId,
  resolveUserByPhone,
} from '@shared';

test.describe('商家-分销商品列表操作 @batch1', () => {
  test('分销商品列表走商家组织 TEST_MERCHANT_ID @batch1', async ({ api, env }) => {
    annotateScenarioApis('商家-分销商品列表操作');
    test.skip(!env.merchantId, '未配置 TEST_MERCHANT_ID（商家组织 orgid）');

    const list = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '分销商品列表' },
      Endpoints.org.adminDistributionList(env.merchantId),
      { query: { page: 1, limit: 10 } },
    );
    expectApiGetSuccess(list.status, list.body);
  });
});

test.describe('商家-分销记录：导出记录 @batch1', () => {
  test('先 GET 商家组织取 merchant_id，再查分销订单 @batch1', async ({ api, env }) => {
    annotateScenarioApis('商家-分销记录：导出记录');
    test.skip(!env.merchantId, '未配置 TEST_MERCHANT_ID（商家组织 orgid）');

    const merchantEntityId = await resolveMerchantEntityId(api, env.merchantId);

    const orders = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '分销记录' },
      Endpoints.merchant.distributionOrder(merchantEntityId),
      {
        query: {
          page: 1,
          limit: 10,
          orderNo: '',
          repoName: '',
          salerName: '',
        },
      },
    );
    expectApiGetSuccess(orders.status, orders.body);
  });
});

test.describe('商家-推广中心：推广记录&推广商品 @batch5', () => {
  test('推广记录 → 推广商品 → spread info @batch5', async ({ api, env, data }) => {
    annotateScenarioApis('商家-推广中心：推广记录&推广商品');
    test.skip(!env.merchantId, '未配置 TEST_MERCHANT_ID（商家组织 orgid）');

    const merchantEntityId = await resolveMerchantEntityId(api, env.merchantId);

    const promotion = await loggedGet(
      api,
      {
        testInfo: test.info(),
        apiBaseURL: env.apiBaseURL,
        logName: '推广记录',
        maxDurationMs: 0,
      },
      Endpoints.org.adminPromotion(env.merchantId),
      { query: { page: 1, limit: 10 } },
    );
    expectApiGetSuccess(promotion.status, promotion.body);

    const spreadGoods = await loggedGet(
      api,
      {
        testInfo: test.info(),
        apiBaseURL: env.apiBaseURL,
        logName: '推广商品列表',
        maxDurationMs: 0,
      },
      Endpoints.merchant.spreadGoods(merchantEntityId),
      { query: { page: 1, limit: 10 } },
    );
    expectApiGetSuccess(spreadGoods.status, spreadGoods.body);

    let spreadRepoId = pickDistributionRepoId(spreadGoods.body);
    if (!spreadRepoId) {
      await fetchCovers(api, test.info(), env.apiBaseURL);
      const course = await provisionMerchantPublishedCourse(api, data, env.merchantId);
      await ensureRepoInDistribution(api, env.merchantId, course.repoId);
      spreadRepoId = course.repoId;
    }

    const spreadInfo = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '推广信息' },
      Endpoints.repo.goodsSpreadInfo(spreadRepoId),
      { query: { orgID: env.merchantId } },
    );
    expectApiGetSuccess(spreadInfo.status, spreadInfo.body);
  });
});

test.describe('商家-推广员：推广记录&分销记录 @batch5', () => {
  test('推广员列表 → 分销记录 @batch5', async ({ api, env }) => {
    annotateScenarioApis('商家-推广员：推广记录&分销记录');
    test.skip(!env.merchantId, '未配置 TEST_MERCHANT_ID（商家组织 orgid）');

    const merchantEntityId = await resolveMerchantEntityId(api, env.merchantId);

    const salers = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '推广员列表' },
      Endpoints.org.salers(env.merchantId),
      { query: { page: 1, limit: 10 } },
    );
    expectApiGetSuccess(salers.status, salers.body);

    const orders = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '分销记录' },
      Endpoints.merchant.distributionOrder(merchantEntityId),
      {
        query: {
          page: 1,
          limit: 10,
          orderNo: '',
          repoName: '',
          salerName: '',
        },
      },
    );
    expectApiGetSuccess(orders.status, orders.body);
  });
});

test.describe('商家-买家列表添加交付删除 @batch8', () => {
  test('建课 → 买家列表 → 交付 → 删买家 @batch8', async ({ api, env, data }) => {
    annotateScenarioApis('商家-买家列表添加交付删除');
    test.skip(!env.merchantId, '未配置 TEST_MERCHANT_ID（商家组织 orgid）');
    test.skip(!env.invitePhone, '未配置 TEST_INVITE_PHONE');

    await fetchCovers(api, test.info(), env.apiBaseURL);
    const course = await provisionMerchantPublishedCourse(api, data, env.merchantId);
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
      Endpoints.org.license(env.merchantId),
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
          logName: '添加买家',
          maxDurationMs: 0,
        },
        Endpoints.org.license(env.merchantId),
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
        Endpoints.org.license(env.merchantId),
        { query: { page: 1, limit: 20, user_type: 0 } },
      );
      expectApiGetSuccess(licenseList.status, licenseList.body);
      licenseId =
        pickLicenseId(licenseList.body, { licenseeId: inviteUser.userId }) ??
        pickLicenseId(licenseList.body, { phone: env.invitePhone });
    }
    if (!licenseId) throw new Error('商家买家列表无 license id');

    data.register(`delete-merchant-license-${env.merchantId}-${licenseId}`, async () => {
      await api.post(
        Endpoints.org.licenseDelete(env.merchantId, licenseId),
        {},
        { maxDurationMs: 0 },
      );
    });

    const authRepos = await loggedGet(
      api,
      {
        testInfo: test.info(),
        apiBaseURL: env.apiBaseURL,
        logName: '待交付课程',
        maxDurationMs: 0,
      },
      Endpoints.org.authRepos(env.merchantId),
      { query: { page: 1, limit: 20 } },
    );
    expectApiGetSuccess(authRepos.status, authRepos.body);

    const grant = await loggedPost(
      api,
      {
        testInfo: test.info(),
        apiBaseURL: env.apiBaseURL,
        logName: '交付课程',
        maxDurationMs: 0,
      },
      Endpoints.org.licenseRepos(env.merchantId),
      buildAddLicenseRepoPayload(inviteUser.userId, course.repoId),
    );
    expectApiWriteSuccess(grant.status, grant.body);
  });
});
