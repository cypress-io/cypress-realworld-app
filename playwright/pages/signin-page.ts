import { FieldComponent } from "../components/input.component";
import { UrlPath } from "../providers/url-path";
import { BasePage } from "./base-page";

type LoginOptions = {
  rememberUser: boolean;
};

export class SignInPage extends BasePage {
  get username() {
    return new FieldComponent(this.page.getByTestId("signin-username"));
  }
  get password() {
    return new FieldComponent(this.page.getByTestId("signin-password"));
  }
  get signInButton() {
    return this.page.getByTestId("signin-submit");
  }
  get rememberMe() {
    return this.page.getByTestId("signin-remember-me");
  }

  async login(username: string, password: string, options?: LoginOptions) {
    await this.page.goto(UrlPath.signin);
    
    await this.username.input.fill(username);
    await this.password.input.fill(password);

    if (options?.rememberUser) {
      await this.rememberMe.click();
    }

    await this.signInButton.click();
  }
}
