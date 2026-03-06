describe("Login - Usuário válido (Smoke)", () => {
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

  it("deve autenticar com credenciais válidas e acessar a aplicação", function () {
    cy.get("@user").then((user: any) => {
      // Fazer login
      cy.login(this.user.username);

      // Validar se logo da tela inicial aparece
      cy.get('[data-test="app-name-logo"]', { timeout: 10000 }).should("be.visible");

      // Validar se nome do usuário aparece no menu lateral
      cy.get('[data-test="sidenav-user-full-name"]')
        .should("be.visible")
        .and("contain", this.user.firstName);
    });
  });
});
