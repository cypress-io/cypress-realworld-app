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
      transactionPage.sendMoney()

      transactionPage.checkSuccessAlert()
        .should('be.visible')
        .and('contain', 'Transaction Submitted!')

      transactionPage.checkBalance().invoke('text').then((balanceAfter) => {
        expect(balanceAfter).not.to.eq(balanceBefore)
      })
    })
  })
  // BUG: sistema permite envio com saldo insuficiente
  // não exibe mensagem "Insufficient Funds" e realiza a transação

  it('Deve exibir mensagem de erro ao enviar dinheiro sem saldo suficiente', () => {
    transactionPage.checkBalance().invoke('text').then((balanceBefore) => {
      transactionPage.insufficientBalanceTransaction()

      cy.contains('Insufficient Funds').should('be.visible')

      transactionPage.checkBalance().invoke('text').then((balanceAfter) => {
        expect(balanceAfter).to.eq(balanceBefore)
      })
    })
  })

})

