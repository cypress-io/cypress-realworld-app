describe('RealWorld App - Tests', () => {

const selectorsList = {
  usernameField: "#username",
  passwordField: "#password",
  loginButton: "button",
  signupButton: "[data-test=\"signup\"]",
  firstName: "#firstName",
  lastName: "#lastName",
  confirmPassword: "#confirmPassword",
  signinError: "[data-test=\"signin-error\"]"
}


  it('Login - Sucess', () => {
    cy.visit('http://localhost:3000/')
    cy.get(selectorsList.usernameField).type('Arvilla_Hegmann')
    cy.get(selectorsList.passwordField).type('s3cret');
    cy.get(selectorsList.loginButton).click({ force: true })
    //Automação do Caso de Teste: Login com sucesso.
  })
  it('Login - Failed', () => {
    cy.visit('http://localhost:3000/')
    cy.get(selectorsList.usernameField).type('TestUser')
    cy.get(selectorsList.passwordField).type('Test');
    cy.get(selectorsList.loginButton).click({ force: true })
    cy.get(selectorsList.signinError)
    //Automação do Caso de Teste: Tentar fazer login com credenciais inválidas.
  });

  it('Login - Valid', () => {
    cy.visit('http://localhost:3000/')
    cy.get(selectorsList.signupButton).click({ force: true })
    cy.get(selectorsList.firstName).type('Ted')
    cy.get(selectorsList.lastName).type('Parisian')
    cy.get(selectorsList.usernameField).type('Heath93')
    cy.get(selectorsList.passwordField).type('s3cret')
    cy.get(selectorsList.confirmPassword).type('s3cret')
    cy.get(selectorsList.loginButton).click({ force: true })
    cy.get(selectorsList.usernameField).type('Heath93')
    cy.get(selectorsList.passwordField).type('s3cret')
    cy.get(selectorsList.loginButton).click({ force: true })
    // Automação do Caso de Teste: Registro de novo usuário com sucesso.
  });

   it('Login - Required information', () => {
    cy.visit('http://localhost:3000/')
    cy.get(selectorsList.signupButton).click({ force: true })
    cy.get(selectorsList.firstName).type('Darrel')
    cy.get(selectorsList.lastName).type('Ortiz')    
    cy.get(selectorsList.usernameField).focus().blur()
    cy.get(selectorsList.passwordField).focus().blur()
    cy.get(selectorsList.confirmPassword).focus().blur()
    cy.get(selectorsList.loginButton).click({ force: true })
    // Automação do Caso de Teste: Tentar registrar um novo usuário com informações incompletas.
  });

});