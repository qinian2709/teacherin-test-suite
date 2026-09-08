# 小程序测试

对 teacherin-student-mnp（uni-app 小程序）写用例。

## 现状

小程序自动化需 minium / 微信开发者工具，Playwright 不直接支持，`tests/miniprogram` 为占位。

## 步骤

1. 确认页面：`pages/index|mine|order|orderDetail|pay|qrcodePage|address|global`。
2. 接入 minium 后再补真实用例，脚本另起，不混入 Playwright。

## 注意

- 不要为占位目录写会误报的 Playwright 用例。
