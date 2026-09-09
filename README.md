# teacherin-test-suite

TeacherIn 统一测试套件。以 pnpm + TypeScript + Playwright 为底座：

- 接口自动化（**以 `teacherin-go-git` 为准**，主站 `/api/v1`）
- Web/H5 端到端（`teacherin-web` 主站、zxjs 管理后台、移动端 H5）
- 小程序自动化（本地微信开发者工具，`RUN_MP=1`）
- 性能压测（k6）

执行、脚手架、报告核心与 `classinshop-test-suite` 对齐；差异只在被测域名、鉴权与用例。

## 能力分层

| 层           | 目录                                  | 说明                                                                            |
| ------------ | ------------------------------------- | ------------------------------------------------------------------------------- |
| 工程底座     | 根目录                                | pnpm workspace、TS、ESLint/Prettier、多环境 `.env.13/.14/.im`                   |
| 配置与环境   | `config/`                             | 环境域名、测试账号/令牌集中管理，按 `TEST_ENV` 切换                             |
| 公共能力     | `shared/`                             | HTTP 封装、token 鉴权、接口常量、数据工厂与清理、日志、Playwright fixtures      |
| 接口自动化   | `tests/api/`                          | 主站 + 管理后台冒烟 / 领域用例                                                  |
| Web/H5 E2E   | `tests/e2e-web/`、`tests/e2e-mobile/` | Playwright + Page Object                                                        |
| 小程序自动化 | `tests/miniprogram/`                  | 仅本地运行                                                                      |
| 性能压测     | `perf/`                               | k6 脚本                                                                         |
| 报告与 CI    | `reports/`、`.gitlab-ci.yml`          | Enhanced / HTML / JUnit / Allure，分环境触发 + 定时回归                         |

## 快速开始

```bash
pnpm setup
cp .env.example .env.local

pnpm test:api
TEST_ENV=14 pnpm test:api
pnpm test:api -- --env 14 --file tests/api/api-demo.spec.ts --open
pnpm test:core -- --env 14 --open
pnpm test:e2e:web
pnpm test:e2e:mobile

pnpm report:enhanced
pnpm report
```

更完整说明见 [docs/run-guide.md](docs/run-guide.md)；
Schedule 变量见 [docs/pipeline-schedule-variables.md](docs/pipeline-schedule-variables.md)；
用例规范见 [docs/test-guidelines.md](docs/test-guidelines.md)。

## 设计原则

- 凭据零硬编码：真实账号/令牌只放 `.env.local`。
- 缺凭据自动跳过：未配置 token 时相关用例 `skip`。
- 数据自清理：`data` 登记表在结束后回收。
- 单一 runner、单一报告：接口、E2E、小程序统一由 Playwright 编排。
