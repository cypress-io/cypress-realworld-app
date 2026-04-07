
class RegisterPage {
  selectors = {
    firstNameField: "[name='firstName']",
    lastNameField: "[name='lastName']",
    usernameField: "[name='username']",
    passwordField: "[name='password']",
    confirmPasswordField: "[name='confirmPassword']",
    signupButton: "[type='submit']",
    firstNameError: "#firstName-helper-text"
  }

  accessRegisterPage() {
    cy.visit('/signup')
  }

  registerUser(firstName, lastName, username, password) {
    cy.get(this.selectors.firstNameField).should('be.visible').type(firstName)
    cy.get(this.selectors.lastNameField).should('be.visible').type(lastName)
    cy.get(this.selectors.usernameField).should('be.visible').type(username)
    cy.get(this.selectors.passwordField).should('be.visible').type(password)
    cy.get(this.selectors.confirmPasswordField).should('be.visible').type(password)
    cy.get(this.selectors.signupButton)
      .should('be.visible')
      .and('not.be.disabled')
      .click()
  }

  fillPartialRegisterForm(lastName, username, password) {
    cy.get(this.selectors.lastNameField).type(lastName)
    cy.get(this.selectors.usernameField).type(username)
    cy.get(this.selectors.passwordField).type(password)
    cy.get(this.selectors.confirmPasswordField).type(password)
  }

  checkSignupButtonDisabled() {
    cy.get(this.selectors.signupButton).should('be.disabled')
  }

  checkFirstNameRequiredMessage() {
    cy.get(this.selectors.firstNameError).should('be.visible')
      .and('contain', 'First Name is required')
  }
}

export default new RegisterPage()