import { Page } from "@playwright/test";

export class SidenavComponent {
  constructor(private page: Page) {}

  signOutButton = () => this.page.locator("[data-test=sidenav-signout]");

  async logout() {
    await this.signOutButton().click();
  }
}
