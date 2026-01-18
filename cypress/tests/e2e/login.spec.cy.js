describe('RealWorld App - Tests', () => {
  it.skip('Login - Sucess', () => {
    cy.visit('http://localhost:3000/')
    cy.get('#username').type('Arvilla_Hegmann')
    cy.get('#password').type('s3cret');
    cy.get('button').click({ force: true })
    //Automação do Caso de Teste: Login com sucesso.
  })
  it.skip('Login - Failed', () => {
    cy.visit('http://localhost:3000/')
    cy.get('#username').type('TestUser')
    cy.get('#password').type('Test');
    cy.get('button').click({ force: true })
    cy.get('[data-test="signin-error"]')
    //Automação do Caso de Teste: Tentar fazer login com credenciais inválidas.
  });

  it.skip('Login - Valid', () => {
    cy.visit('http://localhost:3000/')
    cy.get('[data-test="signup"]').click({ force: true })
    cy.get('#firstName').type('Ted')
    cy.get('#lastName').type('Parisian')
    cy.get('#username').type('Heath93')
    cy.get('#password').type('s3cret')
    cy.get('#confirmPassword').type('s3cret')
    cy.get('button').click({ force: true })
    cy.get('#username').type('Heath93')
    cy.get('#password').type('s3cret')
    cy.get('button').click({ force: true })
    // Automação do Caso de Teste: Registro de novo usuário com sucesso.
  });

   it('Login - Required information', () => {
    cy.visit('http://localhost:3000/')
    cy.get('[data-test="signup"]').click({ force: true })
    cy.get('#firstName').type('Darrel')
    cy.get('#lastName').type('Ortiz')    
    cy.get('#username').focus().blur()
    cy.get('#password').focus().blur()
    cy.get('#confirmPassword').focus().blur()
    cy.get('button').click({ force: true })
    // Automação do Caso de Teste: Tentar registrar um novo usuário com informações incompletas.
  });

});