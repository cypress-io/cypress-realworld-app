// type definitions for Cypress object "cy"
/// <reference types="cypress" />

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
    cy.get("@users").then(user => (this.currentUser = this.users[0]));
  });

  afterEach(function() {
    //cy.task("db:reset");
    cy.task("db:seed");
  });

  context("GET /contacts/:username", function() {
    it("gets a list of contacts by username", function() {
      const { username } = this.currentUser;
      cy.apiLogin(username);

      cy.request("GET", `${apiContacts}/${username}`).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.contacts[0]).to.have.property("user_id");
      });
    });
  });

  /*
  context("POST /users", function() {
    it("creates a new user", function() {
      const first_name = faker.name.firstName();

      cy.request("POST", `${apiUsers}`, {
        first_name,
        last_name: faker.name.lastName(),
        username: faker.internet.userName(),
        password: faker.internet.password(),
        email: faker.internet.email(),
        phone_number: faker.phone.phoneNumber(),
        avatar: faker.internet.avatar()
      }).then(response => {
        expect(response.status).to.eq(201);
        expect(response.body.user).to.contain({ first_name });
      });
    });

    it("error when invalid field sent", function() {
      const { username } = this.currentUser;
      cy.apiLogin(username);

      cy.request({
        method: "POST",
        url: `${apiUsers}`,
        failOnStatusCode: false,
        body: {
          notAUserField: "not a user field"
        }
      }).then(response => {
        expect(response.status).to.eq(422);
        expect(response.body.errors.length).to.eq(1);
      });
    });
  });

  context("PATCH /users/:user_id", function() {
    it("updates a user", function() {
      const first_name = faker.name.firstName();
      const { id, username } = this.currentUser;
      cy.apiLogin(username);

      cy.request("PATCH", `${apiUsers}/${id}`, {
        first_name
      }).then(response => {
        expect(response.status).to.eq(204);
      });
    });

    it("error when invalid field sent", function() {
      const { id, username } = this.currentUser;
      cy.apiLogin(username);

      cy.request({
        method: "PATCH",
        url: `${apiUsers}/${id}`,
        failOnStatusCode: false,
        body: {
          notAUserField: "not a user field"
        }
      }).then(response => {
        expect(response.status).to.eq(422);
        expect(response.body.errors.length).to.eq(1);
      });
    });
  });
  */
});
