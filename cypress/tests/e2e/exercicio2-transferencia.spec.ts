import TransferPage from '../e2e/pages/transferPage'
import database from '../../../data/database.json'
import LoginPage from '../e2e/pages/loginPage'

const loginPage = new LoginPage()
const transferPage = new TransferPage()

describe('Enviar dinheiro com saldo suficiente', () => {
  it.skip('Deve enviar dinheiro com sucesso', () => {
    loginPage.accessLoginPage()
    loginPage.loginUser(database.users[3].username, 's3cret')
    transferPage.acessTransferPage()
    transferPage.selectContactTransfer()
    // transferPage.paymentPage('1', 'Transferencia de teste')
    transferPage.checkTransferSuccessMessage()
  })
})

describe('Enviar dinheiro com saldo insuficiente', () => {
  it('Deve exibir mensagem de erro ao enviar dinheiro sem saldo suficiente', () => {
    loginPage.accessLoginPage()
    loginPage.loginUser('QAUser', 'Senha123')
    transferPage.acessTransferPage()
    transferPage.selectContactTransfer()
    // transferPage.paymentPage('2', 'Transferencia de teste')
    transferPage.checkTransferSuccessMessage()
  });
});
