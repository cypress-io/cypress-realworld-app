import { Page } from "@playwright/test";

export class HomePage {
  constructor(private page: Page) {}

  transactionList = () => this.page.locator("[data-test=transaction-list]");
}
