import { FieldComponent } from "../components/input.component";
import { UrlPath } from "../providers/url-path";
import { BasePage } from "./base.page";

type LoginOptions = {
  rememberUser: boolean;
};

export class SignInPage extends BasePage {
  private readonly prefix = "signin";

  get username() {
    return new FieldComponent(this.page.getByTestId(`${this.prefix}-username`));
  }
  get password() {
    return new FieldComponent(this.page.getByTestId(`${this.prefix}-password`));
  }
  get signInButton() {
    return this.page.getByTestId(`${this.prefix}-submit`);
  }
  get rememberMe() {
    return this.page.getByTestId(`${this.prefix}-remember-me`);
  }
  get signUpLink() {
    return this.page.getByTestId("signup");
  }
  get errorMessage() {
    return this.page.getByTestId(`${this.prefix}-error`);
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
