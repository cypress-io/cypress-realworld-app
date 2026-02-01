class RegistrationPage {
  selectorsList() {
    return {
      firstName: "#firstName",
      lastName: "#lastName",
      usernameField: "#username",
      passwordField: "#password",
      confirmPassword: "#confirmPassword",
      registerButton: '[data-test="signup-submit"]',
      signupButton: '[data-test="signup"]',
    }

  }
  openSignup() {
    cy.visit('/signup')
  }

  openSignupFromLogin() {
    cy.visit('/signin')
    cy.get(this.selectorsList().signupButton).click({ force: true })
  }

  fillFirstName(firstName) {
    cy.get(this.selectorsList().firstName).clear().type(firstName)
  }

  fillLastName(lastName) {
    cy.get(this.selectorsList().lastName).clear().type(lastName)
  }

  fillUsername(username) {
    cy.get(this.selectorsList().usernameField).clear().type(username)
  }

  fillPassword(password) {
    cy.get(this.selectorsList().passwordField).clear().type(password)
  }

  fillConfirmPassword(confirmPassword) {
    cy.get(this.selectorsList().confirmPassword).clear().type(confirmPassword)
  }

  clickRegister() {
    cy.get(this.selectorsList().registerButton).then($btn => {
    cy.log('disabled?', $btn.prop('disabled'))
    cy.get(this.selectorsList().registerButton).click({ force: true })
  })
    
 }

  registerSuccess(user) {
    this.fillFirstName(user.firstName)
    this.fillLastName(user.lastName)
    this.fillUsername(user.username)
    this.fillPassword(user.password)
    this.fillConfirmPassword(user.confirmPassword || user.password)
    this.clickRegister()
  }

  triggerRequiredFieldValidations() {
    cy.get(this.selectorsList().firstName).focus().blur()
    cy.get(this.selectorsList().lastName).focus().blur()
    cy.get(this.selectorsList().usernameField).focus().blur()
    cy.get(this.selectorsList().passwordField).focus().blur()
    cy.get(this.selectorsList().confirmPassword).focus().blur()
    this.clickRegister()
  }
}

export default new RegistrationPage()
