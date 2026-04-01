import loginPage from '../../pages/loginPage'


describe('Login com sucesso', () => {
  it('Deve fazer login com um usuário válido', () => {
    loginPage.accessLoginPage()
    loginPage.loginWithUser('Heath93', 's3cret')
    cy.url().should('not.include', '/signin')

  });

  describe('Tentar fazer login com credenciais inválidas', () => {
    it('Deve exibir uma mensagem de erro ao fazer login com credenciais inválidas', () => {
      loginPage.accessLoginPage()
      loginPage.loginWithUser('usuarioInvalido', 'senhaErrada')
      cy.url().should('include', '/signin')
      loginPage.checkAccessInvalid()
    });

  });




});




