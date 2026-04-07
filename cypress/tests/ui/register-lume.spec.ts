import registerPage from '../../pages/registerPage'

describe('Registro', () => {
  beforeEach(() => {
    registerPage.accessRegisterPage()
  })

  it('Deve registrar um novo usuário com sucesso', () => {
    const username = `user${Date.now()}`
    registerPage.registerUser('Luiz', 'Teste', username, 's3cret')

    cy.url().should('not.include', '/signup')
  })

  it('Deve exibir mensagens de erro ao tentar registrar um novo usuário sem preencher todas as informações obrigatórias', () => {
    registerPage.fillPartialRegisterForm('Teste', `user${Date.now()}`, 's3cret')
    registerPage.checkSignupButtonDisabled()
    registerPage.checkFirstNameRequiredMessage()
  })
})