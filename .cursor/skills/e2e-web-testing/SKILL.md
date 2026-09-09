---
name: e2e-web-testing
description: Follow TeacherIn E2E Web testing conventions for Playwright specs, Page Objects, login-state fixtures, and runner commands.
---

# TeacherIn E2E Web Testing

Use for `tests/e2e-web/**`.

主站页面打的后端接口来自 **`teacherin-go-git`**（`../teacherin-go-git`，`/api/v1`）。需要对照接口、登录态、请求头时，看 go-git 的 `routers/api/v1/` 与 swagger，不要用前端路径反推 API。接口用例本身走 `api-testing` skill。

- Page operations belong in Page Objects extending `tests/e2e-web/pages/BasePage.ts`
- Logged-in flows import `./fixtures/authed.ts` and use `authedHome`
- Do not hardcode domains or tokens; read `@config`
- Admin (zxjs) uses `env.adminBaseURL`

```bash
pnpm test:e2e:web -- --env 14 --file tests/e2e-web/smoke.spec.ts --open
```
