

// Antes de cada teste: permitir o login normalmente
beforeEach(() => {
  cy.intercept(
    { method: 'POST', url: 'http://localhost:3001/login' },
    (req) => req.continue()
  ).as('loginRequest');
});

// Função simples de login
const doLogin = (username = 'Heath93', password = 's3cret') => {
  cy.visit('http://localhost:3000/signin');

  cy.get('input[name="username"]').clear().type(username);
  cy.get('input[name="password"]').clear().type(password);
  cy.get('[data-test="signin-submit"]').click();

  cy.wait('@loginRequest');
  cy.url().should('not.include', '/signin');
};

it('Deve enviar dinheiro com sucesso', () => {

  // 1) LOGIN
  doLogin();

  // 2) CLICAR EM "NEW" — usa fallback se o data-test não existir
  cy.get('body').then(($body) => {
    if ($body.find('[data-test="nav-top-new-transaction"]').length > 0) {
      cy.get('[data-test="nav-top-new-transaction"]').click();
    } else {
      cy.contains('button', 'NEW').click();
    }
  });

  // 3) BUSCAR CONTATO E CLICAR
  cy.get('[data-test="user-list-search-input"]').type('Lia');
  cy.contains('[data-test="users-list"] li', 'Lia Rosenbaum').click();

  // 4) PREENCHER AMOUNT
  cy.get('#amount').clear().type('5');

  // 5) PREENCHER ADD A NOTE
  cy.get('#transaction-create-description-input')
    .clear()
    .type('Pagamento teste');

  // 6) CLICAR EM PAY
  cy.get('[data-test="transaction-create-submit-payment"]').click();

  // 7) VALIDAR SUCESSO
  cy.contains('Transaction Submitted!').should('be.visible');
});

// OBS: O Real World App não valida saldo insuficiente.
// Este teste simula o cenário para fins didáticos.

      
     
