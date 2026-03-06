describe("Transactions - enviar pagamento e validar no feed", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.task("db:seed");
    cy.getRandomUser().as("sender");
  });

  it("deve enviar pagamento e validar no feed", () => {
    cy.get("@sender").then((sender: any) => {
      cy.login(sender.username);

      const amount = Cypress._.random(10, 50).toString();
      const note = `Payment ${Date.now()}`;

      cy.intercept("POST", "**/transactions").as("createTransaction");

      // Iniciar nova transação
      cy.get('[data-test="nav-top-new-transaction"]').click();

      // Escolher usuário destino aleatório (diferente do sender)
      cy.fixture("users").then((data) => {
        const users = data.users;
        const receiver = Cypress._.sample(users.filter((u: any) => u.username !== sender.username));

        cy.get('[data-test="user-list-search-input"]').type(receiver.username);
        cy.contains(receiver.username).click();

        // Preencher pagamento
        cy.get('[data-test="transaction-create-amount-input"]').type(amount);
        cy.get('[data-test="transaction-create-description-input"]').type(note);

        cy.get('[data-test="transaction-create-submit-payment"]').click();

        // Validar criação (assert forte)
        cy.wait("@createTransaction").its("response.statusCode").should("be.oneOf", [200, 201]);

        // Validar detalhes da transação criada
        cy.contains(`Paid $${amount}.00 for ${note}`).should("be.visible");

        // Voltar para feed
        cy.get('[data-test="sidenav-home"]').click();

        // Clicar na tab pessoal para garantir que o feed seja atualizado
        cy.get('[data-test="nav-personal-tab"]').click();

        // Validar presença no feed
        cy.contains(note, { timeout: 10000 }).should("be.visible");
      });
    });
  });
});
