Cypress.Commands.add("getRandomUser", () => {
  return cy.fixture("users").then((data) => {
    const user = Cypress._.sample(data.users);
    return user;
  });
});

Cypress.Commands.add("login", (username: string) => {
  const password = Cypress.env("defaultPassword");

  if (!password) {
    throw new Error("Senha não definida. Configure SEED_DEFAULT_USER_PASSWORD.");
  }

  cy.visit("/signin");

  cy.get("#username").should("be.visible").clear().type(username);
  cy.get("#password").should("be.visible").clear().type(password, { log: false });

  cy.get('[data-test="signin-submit"]').should("be.enabled").click();

  // Validação simples de login
  cy.location("pathname", { timeout: 10000 }).should("not.include", "signin");
});

export {};
