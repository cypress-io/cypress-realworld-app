import { Locator, Page } from "@playwright/test";

class BasePage {
  page: Page;
  constructor(page: Page) {
    this.page = page;
  }
  async clickOnElement(locator: Locator): Promise<void> {
    const element = locator;
    if (!element) {
      throw new Error(`Element not found`);
    }
    await element.click();
  }

  async clearAndBlur(locator: Locator): Promise<void> {
    await locator.clear();
    await locator.blur();
  }
  async fillField(locator: Locator, value: string): Promise<void> {
    await locator.fill(value);
  }
}
export default BasePage;
