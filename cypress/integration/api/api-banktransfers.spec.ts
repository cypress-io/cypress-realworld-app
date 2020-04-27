// check this file using TypeScript if available
// @ts-check

const apiBankTransfer = `${Cypress.env("apiUrl")}/bankTransfers`;

describe("Bank Transfer API", function () {
  before(function () {
    cy.task("db:seed");
    cy.fixture("users").as("users");
    cy.get("@users").then((user) => (this.currentUser = this.users[0]));
  });

  beforeEach(function () {
    const { username } = this.currentUser;
    cy.loginByApi(username);
  });

  afterEach(function () {
    //cy.task("db:reset");
    cy.task("db:seed");
  });

  context("GET /bankTransfer", function () {
    it("gets a list of bank transfers for user", function () {
      const { id } = this.currentUser;
      cy.request("GET", `${apiBankTransfer}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.transfers[0].userId).to.eq(id);
      });
    });
  });
});
