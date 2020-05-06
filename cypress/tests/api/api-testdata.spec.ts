// check this file using TypeScript if available
// @ts-check

const apiTestData = `${Cypress.env("apiUrl")}/testData`;

describe("Test Data API", function () {
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
    cy.task("db:seed");
  });

  context("GET /testData/:entity", function () {
    Cypress._.each(
      [
        "users",
        "contacts",
        "bankaccounts",
        "notifications",
        "transactions",
        "likes",
        "comments",
        "banktransfers",
      ],
      (entity) => {
        it(`gets remote mock data for ${entity}`, function () {
          cy.request("GET", `${apiTestData}/${entity}`).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.results.length).to.be.greaterThan(1);
          });
        });
      }
    );
  });
});
