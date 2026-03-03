import { FieldComponent } from "../components/input.component";
import { BankAccountData } from "../const/bank-account-data";
import { BasePage } from "./base.page";

export class OnboardingPage extends BasePage {
  private readonly userOnboardingPrefix = "user-onboarding";
  get context() {
    return this.page.getByTestId(`${this.userOnboardingPrefix}-dialog`);
  }
  get nextButton() {
    return this.page.getByTestId(`${this.userOnboardingPrefix}-next`);
  }
  get title() {
    return this.page.getByTestId(`${this.userOnboardingPrefix}-dialog-title`);
  }

  private readonly bankAccountPrefix = "bankaccount";
  get bankName() {
    return new FieldComponent(this.page.getByTestId(`${this.bankAccountPrefix}-bankName-input`));
  }
  get accountNumber() {
    return new FieldComponent(
      this.page.getByTestId(`${this.bankAccountPrefix}-accountNumber-input`)
    );
  }
  get routingNumber() {
    return new FieldComponent(
      this.page.getByTestId(`${this.bankAccountPrefix}-routingNumber-input`)
    );
  }
  get saveButton() {
    return this.page.getByTestId(`${this.bankAccountPrefix}-submit`);
  }

  async fillBankAccount(data: BankAccountData) {
    await this.bankName.input.fill(data.bankName);
    await this.routingNumber.input.fill(data.routingNumber);
    await this.accountNumber.input.fill(data.accountNumber);

    await this.saveButton.click();
  }
}
