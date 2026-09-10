import {
  test,
  loggedGet,
  Endpoints,
  annotateScenarioApis,
  expectApiGetSuccess,
  ensureRepoInDistribution,
  fetchCovers,
  pickDistributionRepoId,
  provisionMerchantPublishedCourse,
  resolveMerchantEntityId,
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
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '推广员分销记录' },
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
