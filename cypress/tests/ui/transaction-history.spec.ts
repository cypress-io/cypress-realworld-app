import loginPage from '../../pages/loginPage'
import registerPage from '../../pages/registerPage'
import onboardingPage from '../../pages/onboardingPage'

describe('Visualizar histórico de transações com sucesso', () => {

  beforeEach(() => {
    loginPage.accessLoginPage()
    loginPage.loginWithUser('Dina20', 's3cret')
    cy.location('pathname', { timeout: 10000 }).should('eq', '/')
  })

  it('Deve exibir o histórico de transações de um usuário corretamente', () => {

    cy.get('[data-test="transaction-list"]').should('be.visible')
    cy.get('[data-test^="transaction-item"]').should('have.length.greaterThan', 0)
  })
})

describe('Tentar visualizar o histórico sem transações', () => {

  let username

  beforeEach(() => {
    username = `user${Date.now()}`
    registerPage.accessRegisterPage()
    registerPage.registerUser('Rodrigo', 'Teste', username, 's3cret')
    
    loginPage.accessLoginPage()
    loginPage.loginWithUser(username, 's3cret')
    
    onboardingPage.clickNext()
    onboardingPage.fillBankAccount('Banco Teste', '987654321', '123456789')
    onboardingPage.submitBankAccount()

    // workaround para avançar no modal final de onboarding (Done)
    cy.get('[type="button"]').eq(2).click()

  })

  it('Deve exibir mensagem de histórico vazio', () => {
    cy.contains('Mine').click()
    cy.url().should('include', '/personal')
    cy.contains('No Transactions').should('be.visible')
    cy.contains('Create A Transaction').should('be.visible')
    cy.get('[data-test^="transaction-item"]').should('have.length', 0)
  })
})
