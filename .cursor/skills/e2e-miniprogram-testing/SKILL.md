---
name: e2e-miniprogram-testing
description: Follow TeacherIn miniprogram automation conventions. Local only, requires WeChat DevTools.
---

# TeacherIn Miniprogram Testing

Use for `tests/miniprogram/**`.

小程序后端接口同样来自 **`teacherin-go-git`**，领域在 `routers/api/v1/wechat/`（以及 `api_wechat.go` 注册）。写接口断言走 `api-testing` skill，不要另编一套 path。

- Local only: `RUN_MP=1`，CI never runs this project
- Prepare with `pnpm prepare:mp`（`MP_PROJECT` / `WX_DEVTOOLS_CLI`）
- Placeholder specs should `test.skip` until automator is wired

```bash
pnpm test:mp -- --env 14 --open
```
