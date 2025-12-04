describe('Login com sucesso', () => {

  beforeEach(() => {
    // Sobrescreve o intercept global definido em support/e2e.ts
    cy.intercept(
      { method: 'POST', url: 'http://localhost:3001/login' },
      req => req.continue()
    ).as('loginOverride');
  });

  it('Deve fazer login com um usuário válido', () => {
    cy.visit('http://localhost:3000/signin');

    cy.get('input[name="username"]').type('Heath93');
    cy.get('input[name="password"]').type('s3cret');

    cy.get('[data-test="signin-submit"]').click();

    // Aguarda a requisição real, agora liberada
    cy.wait('@loginOverride');

    // Validação: usuário logado deveria ir para a home
    cy.url().should('include', '/');
  });
});

describe('Tentar fazer login com credenciais inválidas', () => {
  it('Deve exibir uma mensagem de erro ao fazer login com credenciais inválidas', () => {
    // Implemente os passos do caso de teste aqui

    cy.visit('http://localhost:3000/signin')

    cy.get('input[name="username"]').type('eath93')
    cy.get('input[name="password"]').type('3cret')

    cy.get('[data-test="signin-submit"]').click()
    cy.get('[data-test="signin-error"]').should('be.visible')


  });
});
