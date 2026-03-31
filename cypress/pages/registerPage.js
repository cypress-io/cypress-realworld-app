class RegisterPage {
  selectors = {
    firstNameField: "[name='firstName']",
    lastNameField: "[name='lastName']",
    usernameField: "[name='username']",
    passwordField: "[name='password']",
    confirmPasswordField: "[name='confirmPassword']",
    signupButton: "[type='submit']",
    errorMessage: "[role='alert']"
  }

  accessRegisterPage() {
    cy.visit('/signup')
  }

  registerUser(firstName, lastName,  username,  password) {
    cy.get(this.selectors.firstNameField).type(firstName)
    cy.get(this.selectors.lastNameField).type(lastName)
    cy.get(this.selectors.usernameField).type(username)
    cy.get(this.selectors.passwordField).type(password)
    cy.get(this.selectors.confirmPasswordField).type(password)
    cy.get(this.selectors.signupButton).click()
  }

  checkErrorMessage() {
    cy.get(this.selectors.errorMessage).should('be.visible')
  }
}

export default new RegisterPage()