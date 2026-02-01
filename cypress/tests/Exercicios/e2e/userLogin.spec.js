import userData from '../fixtures/userData.json'
import loginPage from '../pages/loginPage'

describe('User Login', () => {

  it('Login - Success', () => {
    loginPage.visit()
    loginPage.loginSuccess(userData.userSuccess.username,userData.userSuccess.password)
  })

  it('Login - Failed', () => {
    loginPage.visit()
    loginPage.loginFailed(userData.userFailed.username, userData.userFailed.password)
  })
})
