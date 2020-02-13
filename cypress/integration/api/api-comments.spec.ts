// check this file using TypeScript if available
// @ts-check

const apiComments = `${Cypress.env("apiUrl")}/comments`;

describe("Comments API", function() {
  before(function() {
    //cy.task("db:reset");
    cy.task("db:seed");
    // TODO: Refactor
    // hacks/experiements
    cy.fixture("users").as("users");
    cy.fixture("transactions").as("transactions");
    cy.get("@users").then(user => (this.currentUser = this.users[0]));
    cy.get("@transactions").then(
      transactions => (this.transactions = transactions)
    );
  });

  beforeEach(function() {
    const { username } = this.currentUser;
    cy.apiLogin(username);
  });

  afterEach(function() {
    cy.task("db:seed");
  });

  context("GET /comments/:transactionId", function() {
    it("gets a list of comments for a transaction", function() {
      const transaction = this.transactions[0];

      cy.request("GET", `${apiComments}/${transaction.id}`).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.comments.length).to.eq(3);
      });
    });
  });

  context("POST /comments/:transactionId", function() {
    it("creates a new comment for a transaction", function() {
      const transaction = this.transactions[0];

      cy.request("POST", `${apiComments}/${transaction.id}`, {
        content: "This is my comment"
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.comment.id).to.be.a("string");
        expect(response.body.comment.content).to.be.a("string");
      });
    });
  });
});
