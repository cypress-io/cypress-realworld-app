describe('Histórico de Transações — Exercício 3', () => {

  beforeEach(() => {
    cy.intercept('POST', '/graphql').as('graphql');

    cy.visit('http://localhost:3000');

    cy.get('input[name="username"]').type('Heath93');
    cy.get('input[name="password"]').type('s3cret');
    cy.get('[data-test="signin-submit"]').click();

    cy.wait('@graphql', { timeout: 12000 });

    cy.get('[data-test="transaction-list"]', { timeout: 12000 })
      .should('be.visible');
  });

  it('Filtra, abre transação e adiciona comentário', () => {

    cy.get('[data-test="transaction-list-filter-date-range-button"]').click();

    cy.contains('8').click({ force: true });

    cy.get('body').click(0, 0);

    cy.get('[data-test^="transaction-item"]')
  .should('have.length.greaterThan', 0)
  .first()
  .click({ force: true });


    cy.contains('Transaction Detail').should('be.visible');

    cy.get('[data-test^="transaction-like-button"]')
      .click({ force: true });


    cy.get('input[name="content"]')
      .type('Comentário automático via Cypress{enter}');

    cy.contains('Comentário automático via Cypress')
      .should('be.visible');
  });

});










