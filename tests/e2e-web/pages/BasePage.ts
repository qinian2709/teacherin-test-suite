import type { Page } from '@playwright/test';

/** Page Object 基类：封装通用导航与就绪等待，子类继承后只声明业务定位器与动作。 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  abstract readonly path: string;

  async goto(): Promise<void> {
    await this.page.goto(this.path, { waitUntil: 'domcontentloaded' });
    await this.waitForReady();
  }

  async waitForReady(): Promise<void> {
    await this.page.waitForLoadState('networkidle').catch(() => undefined);
    const root = this.page.locator('#app, #root, body').first();
    await root.waitFor({ state: 'attached', timeout: 15_000 });
  }

  async title(): Promise<string> {
    return this.page.title();
  }
}
