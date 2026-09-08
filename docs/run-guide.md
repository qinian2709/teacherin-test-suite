# 运行指南

> 目标读者：第一次跑测试的 agent / 新人
> 讲什么：环境准备、按层运行、环境切换、CI
> 最后更新：2026-09-08

## 准备

```bash
npm ci
npx playwright install --with-deps chromium
cp .env.example .env.13   # 或 .env.14 / .env.im，填 API_TOKEN / 账号
```

## 按层运行

```bash
npm run test:api          # API 冒烟（go-git 主站 + go-admin 管理后台）
npm run test:e2e-web      # Web 主站 + 管理后台 E2E
npm run test:e2e-mobile   # 移动端 H5 E2E
npm run test:miniprogram  # 小程序（占位）
npm run run:api           # 命令行快速探测（tsx，不依赖 Playwright）
```

## 环境切换

环境由 `.env.<env>` 决定（`ENV=13/14/15/im/im2/production`）。`config/env.ts` 据此解析两套域名：

- 主站 / 移动端：`BASE_URL` / `API_BASE_URL`（www* 域名）
- 管理后台：`ADMIN_BASE_URL` / `ADMIN_API_BASE_URL`（zxjs* 域名，默认按 ENV 映射）

swagger 均位于 `<BASE_URL>/api/v1/swagger` 与 `<ADMIN_BASE_URL>/api/v1/swagger`。

## 鉴权

Gitea 风格 token：`Authorization: Bearer <API_TOKEN>`，go-git 与 go-admin 两后端一致。未配 token 的鉴权接口预期 401/403，属正常。

## CI

`.gitlab-ci.yml` 在 schedule 流水线跑 api / e2e-web 两路。
