// check this file using TypeScript if available
// @ts-check

const faker = require("faker");

const apiUrl = "http://localhost:3001";
const apiContacts = `${apiUrl}/contacts`;

describe("Contacts API", function() {
  before(function() {
    //cy.task("db:reset");
    cy.task("db:seed");
    // TODO: Refactor
    // hacks/experiements
    cy.fixture("users").as("users");
    cy.fixture("contacts").as("contacts");
    cy.get("@users").then(user => (this.currentUser = this.users[0]));
    cy.get("@contacts").then(contacts => (this.contacts = contacts));
  });

  beforeEach(function() {
    const { username } = this.currentUser;
    cy.apiLogin(username);
  });

  afterEach(function() {
    //cy.task("db:reset");
    cy.task("db:seed");
  });

  context("GET /contacts/:username", function() {
    it("gets a list of contacts by username", function() {
      const { username } = this.currentUser;
      cy.request("GET", `${apiContacts}/${username}`).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.contacts[0]).to.have.property("userId");
      });
    });
  });

  context("POST /contacts", function() {
    it("creates a new contact", function() {
      const { id } = this.currentUser;
      const contact = this.contacts[0];

      cy.request("POST", `${apiContacts}`, {
        contactUserId: contact.id
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.contact.id).to.be.a("string");
        expect(response.body.contact.userId).to.eq(id);
      });
    });

    it("error when invalid contactUserId", function() {
      cy.request({
        method: "POST",
        url: `${apiContacts}`,
        failOnStatusCode: false,
        body: {
          contactUserId: "1234"
        }
      }).then(response => {
        expect(response.status).to.eq(422);
        expect(response.body.errors.length).to.eq(1);
      });
    });
  });
  context("DELETE /contacts/:contactId", function() {
    it("deletes a contact", function() {
      const contact = this.contacts[0];

      cy.request("DELETE", `${apiContacts}/${contact.id}`).then(response => {
        expect(response.status).to.eq(200);
      });
    });
  });
});
