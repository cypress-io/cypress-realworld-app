class LoginPage {
  selectorsList() {
    return {
      usernameField: '#username',
      passwordField: '#password',
      loginButton: '[data-test="signin-submit"]',
      signinError: '.MuiAlert-message',
      sidenavUsername: '[data-test="sidenav-username"]',
      sidenavSignout: '[data-test="sidenav-signout"]'
  
    }
  }

  visit() {
    cy.visit('/signin')
  }

  fillUsername(username) {
    cy.get(this.selectorsList().usernameField).clear().type(username)
  }

  fillPassword(password) {
    cy.get(this.selectorsList().passwordField).clear().type(password)
  }

  clickLogin() {
    cy.get(this.selectorsList().loginButton).click()
  }
  loginSuccess(username, password) {
    this.fillUsername(username)
    this.fillPassword(password)
    this.clickLogin()

    cy.get(this.selectorsList().sidenavUsername, { timeout: 10000 }).should('be.visible').and('contain', username)

    cy.get(this.selectorsList().sidenavSignout).should('be.visible')
  }

  loginFailed(username, password) {
    this.fillUsername(username)
    this.fillPassword(password)
    this.clickLogin()
    cy.get(this.selectorsList().signinError).should('be.visible')
  }
}

export default new LoginPage()
