import { test, loggedGet, loggedPost, Endpoints } from '@shared';
import {
  annotateScenarioApis,
  buildGoodsContentPayload,
  buildGoodsNewbeeAuthPayload,
  expectApiGetSuccess,
  expectApiWriteSuccess,
  fetchCovers,
  pickFirstRepoTreePath,
  buildRepoContentsPayload,
  provisionMerchantPublishedCourse,
} from '@shared';

test.describe('商品展示页-加载流程 @batch8', () => {
  test('销量榜 → 商品页各接口 @batch8', async ({ api, env, data }) => {
    annotateScenarioApis('商品展示页-加载流程');
    test.skip(!env.merchantId, '未配置 TEST_MERCHANT_ID（商家组织 orgid）');

    const keywords = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '销量排行榜' },
      Endpoints.repo.searchKeywords,
    );
    expectApiGetSuccess(keywords.status, keywords.body);

    await fetchCovers(api, test.info(), env.apiBaseURL);
    const course = await provisionMerchantPublishedCourse(api, data, env.merchantId);
    const repoId = course.repoId;

    const permissions = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '商品权限' },
      Endpoints.repo.goodsPermissions(repoId),
    );
    expectApiGetSuccess(permissions.status, permissions.body);

    const goods = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '商品信息' },
      Endpoints.repo.goods(repoId),
    );
    expectApiGetSuccess(goods.status, goods.body);

    const recRepos = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '课程推荐' },
      Endpoints.repo.recRepos(repoId),
    );
    expectApiGetSuccess(recRepos.status, recRepos.body);

    const starred = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '是否收藏' },
      Endpoints.user.starred(repoId),
    );
    expectApiGetSuccess(starred.status, starred.body);

    const ratingTop = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '评价 Top' },
      Endpoints.repo.ratingTop(repoId),
    );
    expectApiGetSuccess(ratingTop.status, ratingTop.body);

    const goodsLms = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '商品 LMS 概览' },
      Endpoints.repo.goodsLms(repoId),
    );
    expectApiGetSuccess(goodsLms.status, goodsLms.body);

    const goodsLmsAll = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '课程设计' },
      Endpoints.repo.goodsLmsAll(repoId),
    );
    expectApiGetSuccess(goodsLmsAll.status, goodsLmsAll.body);

    const lmsDetail = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: 'LMS 详情' },
      Endpoints.repo.contentsLmsDetail(repoId),
      { query: { ref: 'master' } },
    );
    expectApiGetSuccess(lmsDetail.status, lmsDetail.body);

    const rating = await loggedGet(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '评价列表' },
      Endpoints.repo.rating(repoId),
      { query: { page: 1, limit: 10 } },
    );
    expectApiGetSuccess(rating.status, rating.body);

    const contents = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '课程文件列表' },
      Endpoints.repo.contents(repoId),
      buildRepoContentsPayload(''),
    );
    if (contents.status < 400) {
      expectApiWriteSuccess(contents.status, contents.body);
      const treePath = pickFirstRepoTreePath(contents.body);
      if (treePath) {
        const goodsContent = await loggedPost(
          api,
          { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '概览课程文件' },
          Endpoints.repo.goodsContent(repoId),
          buildGoodsContentPayload(treePath),
        );
        expectApiWriteSuccess(goodsContent.status, goodsContent.body);

        const newbeeAuth = await loggedPost(
          api,
          { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '商品 newbee 鉴权' },
          Endpoints.repo.goodsNewbeeAuth(repoId),
          buildGoodsNewbeeAuthPayload(treePath),
        );
        if (newbeeAuth.status >= 500) {
          test.info().annotations.push({
            type: 'note',
            description: 'goods/newbee/auth 依赖教学方案文件，非 nb 路径时可能失败',
          });
        } else if (
          newbeeAuth.body &&
          typeof newbeeAuth.body === 'object' &&
          'code' in newbeeAuth.body &&
          (newbeeAuth.body as { code: number }).code !== 0
        ) {
          test.info().annotations.push({
            type: 'note',
            description: `goods/newbee/auth code=${(newbeeAuth.body as { code: number }).code}`,
          });
        } else {
          expectApiWriteSuccess(newbeeAuth.status, newbeeAuth.body);
        }
      }
    }

    const share = await loggedPost(
      api,
      { testInfo: test.info(), apiBaseURL: env.apiBaseURL, logName: '转发课程' },
      Endpoints.repo.share(repoId),
      {},
    );
    expectApiWriteSuccess(share.status, share.body);
  });
});
