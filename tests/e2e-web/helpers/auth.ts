import type { Page } from '@playwright/test';

const TOKEN_STORAGE_KEYS = ['authorization', 'Authorization', 'token', 'accessToken'] as const;

export async function installAuth(page: Page, authorization: string): Promise<void> {
  await page.context().setExtraHTTPHeaders({ authorization });
  await page.addInitScript(
    ({ token, tokenStorageKeys }) => {
      for (const key of tokenStorageKeys) {
        localStorage.setItem(key, token);
        sessionStorage.setItem(key, token);
      }
    },
    { token: authorization, tokenStorageKeys: [...TOKEN_STORAGE_KEYS] },
  );
}
