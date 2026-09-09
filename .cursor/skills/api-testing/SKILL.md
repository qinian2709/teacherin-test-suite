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

go-git 鉴权（见 `routers/api/v1/api.go` swagger meta）：

- Header：`Authorization`（`token <token>` 或 `Bearer <token>`，套件用 `formatAuthorizationHeader`）
- Query：`token` / `access_token`（`shared/auth` 的 `tokenQuery`）

凭据：

- 主站：`API_TOKEN` / `TEST_TOKEN`
- 缺凭据：依赖登录的 fixture **skip**，不要整套失败
- 未配 token 的鉴权接口冒烟：预期 HTTP 401/403

不要在 spec 里写死 token。

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

## Runner

```bash
pnpm test:api -- --env 14 --file tests/api/api-demo.spec.ts --open
```
