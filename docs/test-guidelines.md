# 测试规范

> 目标读者：写测试用例的 agent / 开发
> 讲什么：目录约定、分层、命名、断言
> 最后更新：2026-09-08

## 分层

| 目录 | 用途 |
|---|---|
| `tests/api` | 后端 `/api/v1` 接口测试（go-git 主站 + go-admin 管理后台） |
| `tests/e2e-web` | Web 主站 + 管理后台（zxjs）端到端 |
| `tests/e2e-mobile` | 移动端 H5 端到端 |
| `tests/miniprogram` | 小程序（占位） |
| `perf` | k6 压测 |

## 约定

- 用例命名 `*.spec.ts`；领域 API 封装进 `shared/api`（主站 `api.*`，管理后台 `adminApi.*`），用例不直接拼 URL。
- 鉴权统一走 `shared/auth` 的 token 注入，不散落硬编码 header。
- 断言用 Playwright `expect`；HTTP 断言用 `shared/utils/assert` 的 `expectOk`。
- 环境相关配置一律读 `config/`，不在用例里写死域名。

## 新增领域

后端新增领域目录（如 `services/xxx` / `routers/api/v1/xxx`）时，在 `shared/api/index.ts` 补最小端点封装，再在 `tests/api` 加冒烟用例。
