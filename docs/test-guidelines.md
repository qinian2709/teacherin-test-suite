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

## 外部步骤：默认只打 TeacherIn 后端

接口测试 **默认全部** 用 `ApiHelper` / `loggedGet` / `loggedPost` 调 **`/api/v1`**（与页面里 `repositoryApi`、`fileApi` 一致）。

### 本地上传课程文件（架构例外）

go-git **没有**「把文件字节 POST 给 TeacherIn 后端」的路由。`POST /repos/{id}/cos` 只登记 **已在 COS 上的** `url`（见 `CreateCosFileV1` → `GetClassInFileID(ctx, url, ...)`）。

页面本地上传同样是：

| 步骤 | 是否 TeacherIn `/api/v1` | 接口 |
|------|--------------------------|------|
| 1 | ✅ 是 | `GET /file/token?flag=7` |
| 2 | ❌ 否 | `PUT` 腾讯云 COS（文件字节不进 TeacherIn 服务） |
| 3 | ✅ 是 | `POST /repos/{id}/cos` |

因此：**不是 SDK 问题**——浏览器用 `cos-js-sdk` 也只是对 COS 做 HTTP PUT；测试里用 `shared/http/cos-direct-put.ts`（纯 HTTP），**禁止** 引 COS npm SDK。

若用例要求 **100% 只调 TeacherIn 后端**（不要任何 COS 直传）：改用云盘链路，例如 `POST /repos/{id}/cos/batch`，不要走本地 fixture 上传。

### 异步转换

COS 登记后 ecos 异步生成，需轮询 `POST /repos/{id}/preview` 直到 `code !== 20144`，再调 transform（`waitForRepoFilePreviewReady`）。

实现参考：`shared/data/repo-file-upload.ts`、`shared/http/cos-direct-put.ts`。

## 新增领域

`teacherin-go-git` 新增领域目录（`routers/api/v1/<领域>`）时，在 `shared/api/endpoints.ts` 补端点常量，在 `shared/api/index.ts` 补最小封装，再在 `tests/api` 加冒烟用例。
