describe("Bank Account - criar e deletar", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.task("db:seed");
    cy.getRandomUser().as("user");
  });

  afterEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it("deve criar e deletar uma conta bancária", () => {
    cy.get("@user").then((user: any) => {
      cy.login(user.username);

      const bankName = `Bank ${Date.now()}`;
      const routingNumber = Cypress._.random(100000000, 999999999).toString();
      const accountNumber = Cypress._.random(100000000, 999999999).toString();

      // Ir para tela de Bank Accounts
      cy.get('[data-test="sidenav-bankaccounts"]').click();
      cy.get('[data-test="bankaccount-new"]').click();

      // Criar Bank Account
      cy.get("#bankaccount-bankName-input").type(bankName);
      cy.get("#bankaccount-routingNumber-input").type(routingNumber);
      cy.get("#bankaccount-accountNumber-input").type(accountNumber);
      cy.get('[data-test="bankaccount-submit"]').click();

      // Validar que a conta apareceu na lista
      cy.contains(bankName).should("be.visible");

      // Deletar a conta recém criada
      cy.contains("li", bankName).find('[data-test="bankaccount-delete"]').click();

      // Validar que a conta foi deletada
      cy.contains("li", `${bankName} (Deleted)`).should("be.visible");
    });
  });
});
