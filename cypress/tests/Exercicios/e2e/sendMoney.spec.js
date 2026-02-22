import loginPage from "../pages/loginPage"
import sendMoneyPage from "../pages/sendMoneyPage"
import userData from "../fixtures/userData.json"

describe('Send money', () => {

  it('money successfully', () => {
    loginPage.visit()
    loginPage.loginSuccess(userData.userSuccess.username,userData.userSuccess.password)
    sendMoneyPage.moneySuccessfully()
    // Enviar dinheiro com saldo suficiente
  })

  it('insufficient balance', () => {
    loginPage.visit()
    loginPage.loginSuccess(userData.userSuccess.username,userData.userSuccess.password)
    sendMoneyPage.insufficientBalance()
    // Enviar dinheiro com saldo suficiente
  })

})