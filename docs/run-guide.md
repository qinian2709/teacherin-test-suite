# 运行手册

## 1. 前置环境

- Node.js >= 18.18（建议 20+）
- pnpm（`corepack enable` 即可）
- 浏览器（E2E）：`pnpm exec playwright install --with-deps`
- k6（性能）：`brew install k6`，详见 [perf/README.md](../perf/README.md)
- 微信开发者工具（小程序）：仅本地，`RUN_MP=1`

## 2. 环境与凭据

环境域名已按 `TEST_ENV` 预置在 `.env.13` / `.env.14` / `.env.im`。真实账号/令牌请写入 `.env.local`（已 gitignore）：

```bash
cp .env.example .env.local
```

加载优先级（高 → 低）：shell 显式变量 > `.env.local` > `.env.<TEST_ENV>` > `.env`。

切换环境：

```bash
TEST_ENV=14 pnpm test:api
TEST_ENV=im pnpm test:e2e:web
```

主站 / 移动端走 `www*`，管理后台走 `zxjs*`。swagger：

- `<WEB_HOST>/api/v1/swagger`
- `<ADMIN_HOST>/api/v1/swagger`

## 3. 鉴权

Gitea 风格 token：`Authorization: Bearer <API_TOKEN>`。go-git 与 go-admin 一致。

1. 主站：`.env.local` 设 `API_TOKEN`（或兼容别名 `TEST_TOKEN`）
2. 管理后台：`ADMIN_API_TOKEN`（缺省回落主站 token）
3. 未配置 token 时，依赖登录的 fixture 用例自动 `skip`；公开接口仍执行。未配 token 的鉴权接口冒烟预期 401/403。

## 4. 运行

单一 runner：`scripts/run-api.ts`。每次运行写入 `reports/runs/<id>/`，`reports/latest` 指向本次。

```bash
pnpm setup
pnpm test:api
pnpm test:api -- --env 14 --file tests/api/api-demo.spec.ts --open
pnpm test:core -- --env 14 --open
pnpm test:e2e:web -- --env 14 --file tests/e2e-web/smoke.spec.ts --open
pnpm test:e2e:mobile
pnpm test:mp
```

报告开关：`--open`（Enhanced） / `--report`（Playwright HTML） / `--allure` / `--notify`。

查看最近报告：

```bash
pnpm report:enhanced
pnpm report
pnpm report:allure:open
```

## 5. CI

`.gitlab-ci.yml` 仅 schedule / 手动 Run pipeline 触发。变量见 [pipeline-schedule-variables.md](./pipeline-schedule-variables.md)。

凭据放 GitLab CI/CD Variables（Masked），不要写进仓库。
