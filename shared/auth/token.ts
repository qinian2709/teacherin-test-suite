// Gitea 风格 token 鉴权：Authorization: Bearer <token> 或 token 参数/header。
// token 从环境变量 API_TOKEN 注入，见 config/env.ts。
export function bearerHeader(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

export function tokenQuery(token: string): string {
  return `token=${encodeURIComponent(token)}`;
}
