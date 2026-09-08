# 移动端 E2E 测试

对 teacherin-mobile-web（uni-app H5）写端到端用例。

## 步骤

1. 确认页面归属：`pages/course|goods|index|manage|mine|order|promot|space|workbench`。
2. 在 `tests/e2e-mobile/<页面>.spec.ts` 写用例。
3. 视口已在 playwright.config.ts 设为 390×844，无需重复设置。

## 注意

- uni-app H5 为 SPA，断言等待 `body` / 关键元素可见。
