import loginPage from "../pages/loginPage"
import transactionsPage from "../pages/transactionsPage"
import userData from "../fixtures/userData.json"

describe('Transactions', () => {

  it('successful transactions', () => {
    loginPage.visit()
    loginPage.loginSuccess(userData.userSuccess.username,userData.userSuccess.password)
    transactionsPage.successfullyTransaction()
    // Deve exibir o histórico de transações de um usuário corretamente
  })

  it('has no previous transactions', () => {
    loginPage.visit()
    loginPage.loginSuccess(userData.userSuccess.username,userData.userSuccess.password)
    transactionsPage.unsuccessfulTransaction()
    // Deve exibir uma mensagem indicando que o usuário não possui transações anteriores
  })

})