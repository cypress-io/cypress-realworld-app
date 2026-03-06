describe("API - Bank Account", () => {
  const apiUrl = Cypress.env("apiUrl");
  const password = Cypress.env("defaultPassword");

  beforeEach(() => {
    cy.task("db:seed");
    cy.getRandomUser().as("user");
  });

  it("deve criar uma bank account com usuário randômico", () => {
    // Gera dados aleatórios para evitar conflitos entre execuções
    const bankName = `API Bank ${Date.now()}`;
    const routingNumber = Cypress._.random(100000000, 999999999).toString();
    const accountNumber = Cypress._.random(100000000, 999999999).toString();

    // Pega usuário randômico
    cy.get("@user").then((user: any) => {
      // Realiza login via API
      cy.request("POST", `${apiUrl}/login`, {
        username: user.username,
        password,
      }).then((loginResponse) => {
        // Valida sucesso do login
        expect(loginResponse.status).to.eq(200);
        // Pega token retornado pela autenticação
        const token = loginResponse.body.accessToken;
        // Cria nova conta bancária via API
        cy.request({
          method: "POST",
          url: `${apiUrl}/bankAccounts`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: {
            bankName,
            routingNumber,
            accountNumber,
          },
        }).then((response) => {
          // Valida dados retornados pela API
          expect(response.status).to.eq(200);
          expect(response.body.account.bankName).to.eq(bankName);
          expect(response.body.account.routingNumber).to.eq(routingNumber);
          expect(response.body.account.accountNumber).to.eq(accountNumber);
        });
      });
    });
  });
});
