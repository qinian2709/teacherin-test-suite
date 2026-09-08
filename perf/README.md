# 压测

k6 脚本。入口 `perf/lib/config.js` 统一加载目标环境。k6 是独立 CLI（非 npm 包），先 `brew install k6`。

## 运行

```bash
k6 run perf/<脚本>.js
```

配置见 `.env.*`（BASE_URL / API_TOKEN）。
