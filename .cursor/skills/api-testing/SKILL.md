---
name: api-testing
description: Follow TeacherIn API testing conventions. Interface specs are written against teacherin-go-git (TI-go-git) /api/v1 routers and swagger, not against the frontend. Use when creating or modifying tests under tests/api, shared/api, or when the user mentions 接口用例, go-git, swagger, API_TOKEN.
---

# TeacherIn API Testing

## Source Of Truth：teacherin-go-git

`tests/api` **只根据 `teacherin-go-git`（TI-go-git）写接口**。不要用前端路由、产品文档或记忆发明 path / 入参 / 鉴权。

仓库位置（与本套件同级）：`../teacherin-go-git`（工作区 `TI/teacherin-go-git`）。

| 看什么 | 路径 |
|---|---|
| 路由注册 | `routers/api/v1/api.go`、`api_web.go`、`api_wechat.go`、`api_external.go` |
| 领域 handler | `routers/api/v1/<领域>/`（user / repo / org / order / catalog / article / merchant / wechat …） |
| swagger 注释 | handler 上的 `// swagger:operation METHOD /path` |
| swagger 模型 | `routers/api/v1/swagger/` |
| 请求体 | `services/requests/api/v1/` |
| 响应体 | `services/responses/api/v1/`、`teacherin-go-libraries/modules/structs` |
| 在线文档 | `<WEB_HOST>/api/v1/swagger`（由 go-git 提供） |

Base path 固定 **`/api/v1`**。主站域名 `www*`。

写新用例前：

1. 在 go-git 找到对应 `swagger:operation` 与路由注册。
2. 把 path 写入 `shared/api/endpoints.ts`，再在 `shared/api/index.ts` 加 `api.<领域>.<方法>`。
3. 在 `tests/api/<领域>.spec.ts` 写断言。用例不直接拼 URL。

go-git 没有的接口：不写用例，或先确认是否另仓（不要猜）。

## Scope

Use this skill for `teacherin-test-suite/tests/api/**` and `shared/api/**`.

## Auth（Gitea / tigit）

主站巡检鉴权在 **框架**里完成，不是用例步骤：

- `TEST_ACCOUNT` → `POST /user/loginbywhiteuser` → session **Cookie**（`shared/auth/login.ts`）
- `api` fixture 自动带 Cookie；spec **不要**再打 `loginbywhiteuser`
- 可选补充：`API_TOKEN` / `TEST_TOKEN`（`Authorization`）

缺 `TEST_ACCOUNT` 且无 token：依赖登录的 fixture **skip**，不要整套失败。

不要在 spec 里写死 token / cookie。

## Response

go-git 以 **HTTP 状态码** 为准（`TigitJSON` / Gitea 风格），**不是** ClassInShop 的统一 `{code,msg,data}`。

- 公开接口：断言 `status < 500` 或具体 200
- 鉴权接口：有 token 期望 200；无 token 期望 401/403
- 仅当响应体确实带 `code` 时才用 `expectEnvelopeSuccess`

## Imports And Fixtures

```ts
import { test, expect } from '@shared';
import { Endpoints, attachApiCallLog } from '@shared';
```

Fixtures（`shared/fixtures/index.ts`）：

- `env`
- `anonApi` — 无 token
- `api` — 主站 token（打 go-git）
- `data` — 清理登记表

不要在每个 spec 里 new 一套 HTTP client。

## Logs

`loggedGet` / `loggedPost` / `attachApiCallLog`。Authorization 会脱敏。

## TeacherIn backend first

Default: every step uses `api` / `loggedGet` / `loggedPost` against **`/api/v1`** only.

### Local course file upload (architectural exception)

go-git has **no** route to POST file bytes to TeacherIn. `POST /repos/{id}/cos` only registers a file already in COS (`url` → `GetClassInFileID`).

Same as the web app:

| Step | TeacherIn `/api/v1`? | Call |
|------|----------------------|------|
| 1 | Yes | `GET /file/token?flag=7` |
| 2 | **No** | `PUT` to Tencent COS (bytes never hit TeacherIn server) |
| 3 | Yes | `POST /repos/{id}/cos` |

Do **not** add COS npm SDKs. Step 2 is plain HTTP in `shared/http/cos-direct-put.ts`.

If a case must be **100% backend API only** (no COS PUT): use cloud disk flow (`POST /repos/{id}/cos/batch`), not local fixture upload.

Poll preview until `code !== 20144` before eppt transform (`waitForRepoFilePreviewReady`).

## Runner

```bash
pnpm test:api -- --env 14 --file tests/api/api-demo.spec.ts --open
```
