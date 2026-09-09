# 性能压测（k6）

使用 [k6](https://k6.io/) 对后端关键接口做基准压测。k6 使用自带 JS 运行时（非 Node），脚本独立于 `shared/`。

## 安装 k6

```bash
brew install k6
```

## 运行

```bash
pnpm perf:baseline
k6 run perf/scenarios/api-baseline.js -e K6_ENV=14 -e TOKEN=<accessToken>
```

## 环境变量

| 变量        | 说明                    | 默认 |
| ----------- | ----------------------- | ---- |
| `K6_ENV`    | 环境 `13` / `14` / `im` | `13` |
| `API_HOST`  | 覆盖 API 域名           | 由 `K6_ENV` 推导 |
| `TOKEN`     | accessToken             | 空   |
