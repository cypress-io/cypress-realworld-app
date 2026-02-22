import userData from '../fixtures/userData.json'
import loginPage from '../pages/loginPage'

describe('User Login', () => {

  it('Login - Success', () => {
    loginPage.visit()
    loginPage.loginSuccess(userData.userSuccess.username,userData.userSuccess.password)
    //Deve fazer login com um usuário válido
  })

  it('Login - Failed', () => {
    loginPage.visit()
    loginPage.loginFailed(userData.userFailed.username, userData.userFailed.password)
    //Deve exibir mensagem de erro ao tentar fazer login com um usuário inválido
  })
})
