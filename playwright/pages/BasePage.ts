import { Page, expect } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  /**
   * Navigate to a specific URL
   */
  async goto(url: string) {
    await this.page.goto(url);
  }

  /**
   * Wait for the page to have a specific URL
   */
  async expectToHaveUrl(url: string | RegExp) {
    await expect(this.page).toHaveURL(url);
  }
}
