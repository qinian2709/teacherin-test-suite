/** 领域端点常量。用例与封装只引用这里，不散落硬编码 path。 */
export const Endpoints = {
  swagger: '/swagger',
  user: {
    /** go-git: GET /user — GetAuthenticatedUser */
    current: '/user',
  },
  repo: {
    /** go-git: GET /repos/search — RepoSearch */
    search: '/repos/search',
  },
  admin: {
    swagger: '/swagger',
    miscVersion: '/misc/version',
  },
} as const;
