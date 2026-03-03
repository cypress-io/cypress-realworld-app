import { BasePage } from "./base-page";

export class SideNavPage extends BasePage {
  get toggle() {
    return this.page.getByTestId("sidenav-toggle");
  }

  get signOutbutton() {
    return this.page.getByTestId("sidenav-signout");
  }
}
