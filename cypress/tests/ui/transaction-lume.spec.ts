import loginPage from '../../pages/loginPage'
import transactionPage from '../../pages/transactionPage'

describe('Enviar dinheiro', () => {

  beforeEach(() => {
    loginPage.accessLoginPage()
    loginPage.loginWithUser('Heath93', 's3cret')
    cy.url().should('not.include', '/signin')
  })

  it('Deve enviar dinheiro com saldo suficiente', () => {
    transactionPage.checkBalance().invoke('text').then((balanceBefore) => {
      transactionPage.sendMoney("100", "payment test", "WHjJ4qR2R2")


      transactionPage.checkSuccessAlert()
        .should('be.visible')
        .and('contain', 'Transaction Submitted!')

      transactionPage.checkBalance().invoke('text').then((balanceAfter) => {
        expect(balanceAfter).not.to.eq(balanceBefore)
      })
    })
  })

  // BUG: sistema permite envio com saldo insuficiente
  // não exibe mensagem "Insufficient Funds" e realiza a transaçã
  it('Deve exibir mensagem de erro ao enviar dinheiro sem saldo suficiente', () => {
    cy.get("[href='/transaction/new']").click()
    cy.url().should('include', '/transaction/new')

    cy.get("[data-test='user-list-item-WHjJ4qR2R2']")
      .scrollIntoView()
      .should('be.visible')
      .click()

    cy.get("input[name='amount']").should('be.visible').type("40000000")
    cy.get("[placeholder='Add a note']").type("teste saldo insuficiente")
    cy.get("[data-test='transaction-create-submit-payment']").click()

    cy.contains('Insufficient Funds').should('be.visible')
  })

})





