
  import userData from '../fixtures/userData.json'
  import registrationPage from '../pages/registrationPage'

describe('Usuário Registrado', () => {

  it('Register - Success', () => {
    registrationPage.openSignup()
    registrationPage.registerSuccess(userData.userValid)
    //Deve registrar um novo usuário com sucesso
  })

  it('Register - Required information', () => {
    registrationPage.openSignup()
    registrationPage.triggerRequiredFieldValidations()
    //Deve exibir mensagens de validação para campos obrigatórios
  })

})

