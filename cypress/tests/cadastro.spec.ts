
// RWA - Exercício de Testes Automatizados com Cypress 01

describe('Tela de Cadastro', () => {
  // Mapeamento dos seletores utilizados nos testes
  // Facilita a manutenção - se um seletor mudar, atualiza apenas aqui
  const selectorsList = {
    accountField: "[data-test='signup']",
    firstNameField: "[name='firstName']",
    lastNameField: "[name='lastName']", 
    usernameField: "[name='username']",
    passwordField: "[name='password']",
    confirmPasswordField: "[name='confirmPassword']",
    signupButton: "[data-test='signup-submit']",
    errorMessage: "[data-test='signup-confirmPassword']"
} 
  const userData = {
    firstName: 'Thayse',
    lastName: 'Dias',
    username: 'thaysedias13',
    password: 'Td252603###',
    confirmPassword: 'Td252603###',
    wrongPassword: 'Td252603'
  }

  beforeEach(() => {
    cy.visit('http://localhost:3000/signin')
  })

  it('Cadastro de Usuário com sucesso', () => {
    cy.get(selectorsList.accountField).click()
    cy.get(selectorsList.firstNameField).type(userData.firstName)
    cy.get(selectorsList.lastNameField).type(userData.lastName)
    cy.get(selectorsList.usernameField).type(userData.username)
    cy.get(selectorsList.passwordField).type(userData.password)
    cy.get(selectorsList.confirmPasswordField).type(userData.confirmPassword)
    cy.get(selectorsList.signupButton).click()

    // Validação do cadastro bem-sucedido
    cy.url().should('include', '/signin')

  })

  it.only('Cadastro de Usuário com falha na confirmação da senha', () => {
    cy.get(selectorsList.accountField).click()
    cy.get(selectorsList.firstNameField).type(userData.firstName)
    cy.get(selectorsList.lastNameField).type(userData.lastName)
    cy.get(selectorsList.usernameField).type(userData.username)
    cy.get(selectorsList.passwordField).type(userData.password)
    cy.get(selectorsList.confirmPasswordField).type(userData.wrongPassword)

    // Validação da mensagem de erro
    cy.get(selectorsList.errorMessage).should('contain.text', 'Password does not match')

  })
})
