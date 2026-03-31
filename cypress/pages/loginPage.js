class LoginPage {
  selectors = {
    usernameField: "[name='username']",
    passwordField: "[name='password']",
    loginButton: "[type='submit']",
    wrongCredentialAlert: "[role='alert']",
  }

  accessLoginPage() {
    cy.visit('/signin') // ⚠️ rota correta do RWA
  }

  loginWithUser(username, password) {
    cy.get(this.selectors.usernameField).type(username)
    cy.get(this.selectors.passwordField).type(password)
    cy.get(this.selectors.loginButton).click()
  }

  checkAccessInvalid() {
    cy.get(this.selectors.wrongCredentialAlert).should('be.visible')
  }
}

export default new LoginPage()