describe("Successful Login", () => {
  it("Should log in and show New Transaction page", () => {
    cy.visit("http://localhost:3000/signin");
    cy.get("[name='username']").type("Heath93");
    cy.get("[name='password']").type("s3cret");
    cy.get("button[type='submit']").click();
    cy.contains("Public").should("be.visible");
  });
});
