import { BasePage } from "./base.page";

export class HomePage extends BasePage {
  get transactions() {
    return this.page.getByTestId("transaction-list");
  }
}
