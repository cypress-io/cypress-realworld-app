describe("API - Auth", () => {
  const apiUrl = Cypress.env("apiUrl");
  const password = Cypress.env("defaultPassword");

  beforeEach(() => {
    cy.task("db:seed");
    cy.getRandomUser().as("user");
  });

  it("deve autenticar com usuário randômico com sucesso", () => {
    // Pega usuário random
    cy.get("@user").then((user: any) => {
      cy.request("POST", `${apiUrl}/login`, {
        username: user.username,
        password,
      }).then((loginResponse) => {
        // Valida status code
        expect(loginResponse.status).to.eq(200);
        // Valida que o username retornado é o mesmo do usuário utilizado para login
        expect(loginResponse.body.user.username).to.eq(user.username);
      });
    });
  });
});
