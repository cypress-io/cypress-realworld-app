
// RWA - Exercício de Testes Automatizados com Cypress 01

describe('Teste de Login', () => {
  // Mapeamento dos seletores utilizados nos testes
  const selectorsList = {
    usernameField: "[name='username']",
    passwordField: "[name='password']",
    remembercheckbox: "[type='checkbox']", 
    loginButton: "[type='submit']",
    wrongCredentialsAlert: ".SignInForm-alertMessage",
    onboardingDialog: "[data-test='user-onboarding-dialog-title']", 
  }

  beforeEach(() => {
    cy.visit('http://localhost:3000/signin')
  })

  it('Login - Sucess', () => {
    cy.get(selectorsList.usernameField).type('thaysedias')
    cy.get(selectorsList.passwordField).type('Td252603##')
    cy.get(selectorsList.remembercheckbox).check()
    cy.get(selectorsList.loginButton).click()
    
    // Validação do login bem-sucedido
    cy.get(selectorsList.onboardingDialog).should('be.visible')
  })

  it.only('Login - Fail', () => {
    cy.get(selectorsList.usernameField).type('usuarioInvalido')
    cy.get(selectorsList.passwordField).type('senhaInvalida')
    cy.get(selectorsList.loginButton).click()

    // Validação de erro
    cy.get(selectorsList.wrongCredentialsAlert).should('contain.text', 'Username or password is invalid')
  })
})
