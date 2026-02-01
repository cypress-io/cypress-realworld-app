
  import userData from '../fixtures/userData.json'
  import registrationPage from '../pages/registrationPage'

describe('Usuário Registrado', () => {

  it('Register - Success', () => {
    registrationPage.openSignup()
    registrationPage.registerSuccess(userData.userValid)
  })

  it('Register - Required information', () => {
    registrationPage.openSignup()
    registrationPage.triggerRequiredFieldValidations()
  })

})

