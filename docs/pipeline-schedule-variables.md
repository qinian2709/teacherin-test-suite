# Pipeline Schedule 执行配置说明

本文档只说明 **Pipeline Schedule 的执行策略**：跑哪个环境、跑哪些项目、报告如何发布、企微如何通知。

**不包含** 被测系统凭据（Token、E2E 账号等）——那些属于测试环境依赖，见 [`docs/run-guide.md`](./run-guide.md) 与 [`.env.example`](../.env.example)。

适用项目：`teacherin-test-suite`  
配置入口：GitLab → **Settings → CI/CD → Variables**（或 Schedule 条目上单独覆盖）

---

## 1. Schedule 执行流程

Schedule 触发（`CI_PIPELINE_SOURCE=schedule`）后：

1. 读取 `SCHEDULE_TEST_ENV` → 选择被测环境（13 / 14 / 15 / im / im2 / production）
2. 读取 `TEST_SUITE_PROJECTS` → 选择 Playwright 项目（`api` / `e2e-web` / `e2e-mobile`）
3. 单次 Job 跑完 → 生成 Enhanced 报告
4. 若配置了 `REPORT_PUBLISH_*` → push 到 Coolify 静态站
5. 发送企微通知（报告链接优先 Coolify URL）

本仓库已关闭 push 和 merge 流水线；Schedule **不会**跑 api demo，**默认跑全量 API**。

---

## 2. 创建 Schedule

1. GitLab：**Build → Pipeline schedules → New schedule**
2. Cron 例：`0 2 * * *`（每天 02:00）
3. **Target branch**：定时任务使用的代码分支
4. 配置下文 **执行变量**

---

## 3. 执行变量一览

| 变量 | 必须？ | 默认值 | 作用 |
|------|--------|--------|------|
| `SCHEDULE_TEST_ENV` | 可选 | `14` | 被测环境 |
| `TEST_SUITE_PROJECTS` | 可选 | `api` | 逗号分隔：`api`、`e2e-web`、`e2e-mobile` |
| `REPORT_PUBLISH_BASE_URL` | 推荐 | — | Coolify 报告站点 URL 前缀 |
| `REPORT_PUBLISH_GIT_REPO` | 推荐 | — | 报告托管 Git 仓库 |
| `REPORT_PUBLISH_GIT_TOKEN` | 推荐 | — | push 报告仓库的 PAT（Masked） |
| `WECOM_WEBHOOK_URL` | 可选 | — | 企微 Webhook |
| `WECOM_MENTION_MOBILES` | 可选 | — | 失败 @ 人的企微绑定手机号，逗号分隔；成功不 @ |
| `WECOM_PUBLISH_WAIT_SECONDS` | 可选 | `30` | 发企微前等待报告 URL 就绪（秒），`0` 关闭 |
| `REPORT_PUBLISH_MODE` | 可选 | 自动 | `coolify` / `rsync` / `local` |
| `REPORT_PUBLISH_GIT_BRANCH` | 可选 | `main` | 报告仓库分支 |
| `PLAYWRIGHT_IMAGE` | 可选 | 见 `.gitlab-ci.yml` | Runner 镜像 |
| `PNPM_VERSION` | 可选 | `10` | pnpm 版本 |

不配报告三件套：测试和 GitLab Artifacts 仍有；不会 push Coolify。  
不配 `WECOM_WEBHOOK_URL`：跳过企微通知。

---

## 4. `TEST_SUITE_PROJECTS`

| 取值 | 含义 |
|------|------|
| 不配置 | 默认 `api` → 全量 `tests/api` |
| `api` | 同上 |
| `api,e2e-web` | API 全量 + PC E2E |
| `api,e2e-web,e2e-mobile` | API + Web + H5 E2E |
| `e2e-web,e2e-mobile` | 仅 E2E |

---

## 5. 报告过期清理（独立 Schedule）

| 变量 | 必须？ | 作用 |
|------|--------|------|
| `SCHEDULE_TASK` | **是** | 设为 `cleanup-reports` 时只跑清理 Job |
| `RETENTION_DAYS` | 可选 | 默认 `7` |
| `REPORT_PUBLISH_GIT_REPO` | **是** | 报告仓库 URL |
| `REPORT_PUBLISH_GIT_TOKEN` | **是** | push 权限 PAT |
| `SQUASH_GIT_HISTORY` | 可选 | 默认开启；设 `0` 不压历史 |
| `SCHEDULE_CLEANUP_REPORTS` | Web 用 | 手动触发清理时设为 `1` |

与夜间回归 **分开两条 Schedule**。
