import { env, sessionCookieHeader, accounts, formatAuthorizationHeader } from '../config/index.js';
import { resolveAuthTokens } from '../shared/auth/login.js';
import { ApiHelper } from '../shared/fixtures/api-helper.js';
import { DataRegistry } from '../shared/data/cleanup.js';
import { browserHeaders } from '../shared/http/browser-headers.js';
import {
  provisionMerchantPublishedCourse,
  provisionOrgPublishedCourse,
  provisionPersonalCourse,
} from '../shared/data/course-provision.js';

async function main(): Promise<void> {
  await resolveAuthTokens();
  if (!accounts.sessionCookie && !accounts.token) {
    throw new Error('鉴权失败：没有 cookie / token');
  }

  const api = new ApiHelper(env.apiBaseURL, {
    ...browserHeaders(),
    ...(accounts.token ? { Authorization: formatAuthorizationHeader(accounts.token) } : {}),
    ...sessionCookieHeader(),
  });
  const data = new DataRegistry();

  console.log(`[smoke] env=${env.name} api=${env.apiBaseURL} org=${env.orgId} merchant=${env.merchantId}`);

  const personal = await provisionPersonalCourse(api, data);
  console.log(`[smoke] personal ok repoId=${personal.repoId} name=${personal.name}`);

  const org = await provisionOrgPublishedCourse(api, data, env.orgId);
  console.log(`[smoke] org published ok repoId=${org.repoId} name=${org.name}`);

  const merchant = await provisionMerchantPublishedCourse(api, data, env.orgId);
  console.log(`[smoke] merchant published ok repoId=${merchant.repoId} name=${merchant.name}`);

  await data.runAll();
  console.log('[smoke] cleanup done');
}

main().catch((err) => {
  console.error('[smoke] FAILED', err);
  process.exit(1);
});
