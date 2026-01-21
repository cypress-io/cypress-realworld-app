import userData from '../fixtures/userdata.json'

describe('RealWorld App - Tests', () => {

const selectorsList = {
  usernameField: "#username",
  passwordField: "#password",
  loginButton: "button",
  signupButton: "[data-test=\"signup\"]",
  firstName: "#firstName",
  lastName: "#lastName",
  confirmPassword: "#confirmPassword",
  signinError: "[data-test=\"signin-error\"]",
}

  it('Login - Sucess', () => {
    cy.visit('http://localhost:3000/')
    cy.get(selectorsList.usernameField).type(userData.userSucess.username)
    cy.get(selectorsList.passwordField).type(userData.userSucess.password)
    cy.get(selectorsList.loginButton).click()
    cy.location('pathname', { timeout: 10000 }).should('include', '/')
    cy.get('nav').contains(userData.userSucess.username).should('be.visible')
    //Automação do Caso de Teste: Login com sucesso.
  })

  it.skip('Login - Failed', () => {
    cy.visit('http://localhost:3000/')
    cy.get(selectorsList.usernameField).type(userData.userFailed.username)
    cy.get(selectorsList.passwordField).type(userData.userFailed.password)
    cy.get(selectorsList.loginButton).click({ force: true })
    cy.get(selectorsList.signinError)
    //Automação do Caso de Teste: Tentar fazer login com credenciais inválidas.
  })

  it.skip('Login - Valid', () => {
    cy.visit('http://localhost:3000/')
    cy.get(selectorsList.signupButton).click({ force: true })
    cy.get(selectorsList.firstName).type(userData.userValid.firstName)
    cy.get(selectorsList.lastName).type(userData.userValid.lastName)
    cy.get(selectorsList.usernameField).type(userData.userValid.username)
    cy.get(selectorsList.passwordField).type(userData.userValid.password)
    cy.get(selectorsList.confirmPassword).type(userData.userValid.confirmPassword)
    cy.get(selectorsList.loginButton).click({ force: true })
    cy.get(selectorsList.usernameField).type(userData.userValid.username)
    cy.get(selectorsList.passwordField).type(userData.userValid.password)
    cy.get(selectorsList.loginButton).click({ force: true })
    // Automação do Caso de Teste: Registro de novo usuário com sucesso.
  })

   it.skip('Login - Required information', () => {
    cy.visit('http://localhost:3000/')
    cy.get(selectorsList.signupButton).click({ force: true })
    cy.get(selectorsList.firstName).type(userData.incompleteUserdata.firstName)
    cy.get(selectorsList.lastName).type(userData.incompleteUserdata.lastName)    
    cy.get(selectorsList.usernameField).focus().blur()
    cy.get(selectorsList.passwordField).focus().blur()
    cy.get(selectorsList.confirmPassword).focus().blur()
    cy.get(selectorsList.loginButton).click({ force: true })
    // Automação do Caso de Teste: Tentar registrar um novo usuário com informações incompletas.
  })

})
