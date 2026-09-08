# API 测试

对 TeacherIn 两个后端写接口测试：go-git 主站（`routers/api/v1`，www* 域名）与 go-admin 管理后台（`routers/api/v1`，zxjs* 域名，领域 admin/misc/repo）。

## 步骤

1. 从 swagger（`<BASE_URL>/api/v1/swagger`）或后端 `routers/api/v1/<领域>/` 确认端点。
2. 领域端点封装进 `shared/api/index.ts`（`api.<领域>.<方法>`）。
3. 在 `tests/api/<领域>.spec.ts` 写冒烟用例，断言状态码 / 关键字段。
4. 鉴权用 `shared/auth` 的 token，不写死 header。

## 注意

- 环境走 `config/env.ts`，不硬编码域名。
- 未配 token 的鉴权接口预期 401/403。
