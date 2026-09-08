# Web 主站 E2E 测试

对 teacherin-web（Vue3 + ant-design-vue）写端到端用例。

## 步骤

1. 确认页面归属模块：`src/classx|course|home|lms|org|shops|user|pages`。
2. 在 `tests/e2e-web/<模块>.spec.ts` 写用例，`page.goto('/')` 走 baseURL。
3. 断言用 Playwright `expect`。

## 注意

- baseURL 由 `config/env.ts` 注入，`page.goto('/')` 即对应环境首页。
