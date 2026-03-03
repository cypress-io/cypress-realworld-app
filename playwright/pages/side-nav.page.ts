import { BasePage } from "./base.page";

export class SideNavPage extends BasePage {
  private readonly sidenavPrefix = "sidenav";

  // Note: only mobile
  get toggle() {
    return this.page.getByTestId(`${this.sidenavPrefix}-toggle`);
  }
  get signOutButton() {
    return this.page.getByTestId(`${this.sidenavPrefix}-signout`);
  }
  get notificationsCount() {
    return this.page.getByTestId(`${this.sidenavPrefix}-top-notifications-count`);
  }

  async signOut(isMobile: boolean) {
    if (isMobile) {
      await this.toggle.click();
    }
    await this.signOutButton.click();
  }
}
