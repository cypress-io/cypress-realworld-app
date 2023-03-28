export enum UserSettingsFormFields {
  firstName = "firstNameInput",
  lastName = "lastNameInput",
  email = "emailInput",
  phoneNumber = "phoneNumberInput",
}

export class UserSettingsPage {
  private pageTitle = cy.get("#user-settings-title");

  private firstNameInput = cy.get("#user-settings-firstName-input");
  private lastNameInput = cy.get("#user-settings-lastName-input");
  private emailInput = cy.get("#user-settings-email-input");
  private phoneNumberInput = cy.get("#user-settings-phoneNumber-input");

  private saveButton = cy.get("#user-settings-save-button");

  /**
   * Given a text, checks that that the page title (an element) has that same text.
   *
   *
   * @param text - The value that we want to check if the page title is
   * @returns Nothing
   *
   */
  public checkPageTitle(text: string) {
    // Why we use a regExp: https://stackoverflow.com/questions/56443963/click-an-exact-match-text-in-cypress
    const regExpText = new RegExp(`^${text}$`, "g");
    this.pageTitle.contains(regExpText).should("exist");
  }

  /**
   * Clears a field from the form.
   *
   *
   * @param field - The field that we want to clear
   * @returns Nothing
   *
   */
  public clear(field: UserSettingsFormFields) {
    this[field].clear();
  }

  /**
   * Types on a field from the form.
   *
   *
   * @param field - The field that we want to type on
   * @param text - The value that we want to type
   * @returns Nothing
   *
   */
  public type(field: UserSettingsFormFields, text: string) {
    this[field].type(text).blur();
  }

  /**
   * Clears a field from the form and fills it with new text.
   *
   *
   * @param field - The field that we want to clear and fill
   * @param text - The new value that we want for the field
   * @returns Nothing
   *
   */
  public fillField(field: UserSettingsFormFields, text: string) {
    this[field].clear();
    this[field].type(text).blur();
  }

  /**
   * Clicks on the save button.
   *
   *
   * @params Nothing
   * @returns Nothing
   *
   */
  public clickSaveButton() {
    this.saveButton.click();
  }
}
