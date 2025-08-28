describe("Prompt", () => {
  it("should be able to create a new prompt", () => {
    cy.prompt([
      "go to https://cypress.io",
      "Click on the pricing tab",
      "Do you have personal opinions?",
    ]);
  });
});
