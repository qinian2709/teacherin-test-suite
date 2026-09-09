---
name: e2e-mobile-testing
description: Follow TeacherIn H5 E2E conventions for Playwright mobile specs, Page Objects, and runner commands.
---

# TeacherIn E2E Mobile Testing

Use for `tests/e2e-mobile/**`.

H5 调用的后端接口来自 **`teacherin-go-git`**（`../teacherin-go-git`，`/api/v1`）。对照 path / 鉴权看 go-git `routers/api/v1/`，不要用页面 URL 当 API。接口用例走 `api-testing` skill。

- Viewport comes from the `e2e-mobile` Playwright project
- Logged-in flows import `./fixtures/authed.ts`
- `baseURL` is `env.mobileBaseURL`

```bash
pnpm test:e2e:mobile -- --env 14 --open
```
