# 测试规范

> 目标读者：写测试用例的 agent / 开发
> 讲什么：目录约定、分层、命名、断言
> 最后更新：2026-09-08

## 分层

| 目录 | 用途 |
|---|---|
| `tests/api` | 后端 `/api/v1` 接口测试；**以 `teacherin-go-git` 为准** |
| `tests/e2e-web` | Web 主站 + 管理后台（zxjs）端到端 |
| `tests/e2e-mobile` | 移动端 H5 端到端 |
| `tests/miniprogram` | 小程序（本地 `RUN_MP=1`） |
| `perf` | k6 压测 |

## 接口来源（强制）

接口用例只根据 **`teacherin-go-git`**（同级目录 `../teacherin-go-git`）编写：

- 路由：`routers/api/v1/api.go` / `api_web.go` / `api_wechat.go`
- handler：`routers/api/v1/<领域>/`
- swagger：`swagger:operation` 注释 + `<WEB_HOST>/api/v1/swagger`

go-git 没有的接口不写。不要用前端或记忆发明 path。

## 约定

- 用例命名 `*.spec.ts`；领域 API 封装进 `shared/api`（主站 `api.*`，管理后台 `adminApi.*`），用例不直接拼 URL。
- 新接口用例优先用 `@shared` 的 `test` fixture：`api` / `adminApi` / `anonApi` / `data`。
- 请求日志用 `loggedGet` / `loggedPost` / `attachApiCallLog`，header 里的 token 会脱敏。
- 鉴权统一走 `shared/auth` 的 token 注入，不散落硬编码 header。
- 断言用 Playwright `expect`；HTTP 断言用 `expectOk`。
- 环境相关配置一律读 `config/`，不在用例里写死域名。
- 缺凭据自动 `skip`，不要让整套失败。
- 用例创建的数据用 `data.register` 登记清理。

## 新增领域

`teacherin-go-git` 新增领域目录（`routers/api/v1/<领域>`）时，在 `shared/api/endpoints.ts` 补端点常量，在 `shared/api/index.ts` 补最小封装，再在 `tests/api` 加冒烟用例。
