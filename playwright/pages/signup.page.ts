import { FieldComponent } from "../components/input.component";
import { UserData } from "../const/user-data";
import { BasePage } from "./base.page";

export class SignUpPage extends BasePage {
  private readonly prefix = "signup";

  get title() {
    return this.page.getByTestId(`${this.prefix}-title`);
  }
  get firstName() {
    return new FieldComponent(this.page.getByTestId(`${this.prefix}-first-name`));
  }
  get lastName() {
    return new FieldComponent(this.page.getByTestId(`${this.prefix}-last-name`));
  }
  get username() {
    return new FieldComponent(this.page.getByTestId(`${this.prefix}-username`));
  }
  get password() {
    return new FieldComponent(this.page.getByTestId(`${this.prefix}-password`));
  }
  get confirmPassword() {
    return new FieldComponent(this.page.getByTestId(`${this.prefix}-confirmPassword`));
  }
  get signUpButton() {
    return this.page.getByTestId(`${this.prefix}-submit`);
  }

  async signUp(data: UserData) {
    await this.firstName.input.fill(data.firstName);
    await this.lastName.input.fill(data.lastName);
    await this.username.input.fill(data.username);
    await this.password.input.fill(data.password);
    await this.confirmPassword.input.fill(data.password);

    await this.signUpButton.click();
  }
}
