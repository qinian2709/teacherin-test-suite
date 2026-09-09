import { formatAuthorizationHeader } from '../../config/index.js';

/** Gitea 风格 token：Authorization: Bearer <token> 或 query token=。 */
export function bearerHeader(token: string): Record<string, string> {
  return { Authorization: formatAuthorizationHeader(token) };
}

export function tokenQuery(token: string): string {
  return `token=${encodeURIComponent(token)}`;
}
