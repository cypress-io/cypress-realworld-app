describe("Auth", () => {
  it("redirects visitors to sign in page", () => {
    cy.task("db:seed");
    cy.visit("/personal");
    cy.location("pathname").should("equal", "/signin");
  });
});
