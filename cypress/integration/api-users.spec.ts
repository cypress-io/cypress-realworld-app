// type definitions for Cypress object "cy"
/// <reference types="cypress" />

// check this file using TypeScript if available
// @ts-check

const faker = require("faker");

const apiUrl = "http://localhost:3001";
const apiUsers = `${apiUrl}/users`;

describe("Users API", function() {
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

  context("GET /users", function() {
    it("gets a list of users", function() {
      cy.apiLogin(this.currentUser.username);

      cy.request("GET", apiUsers).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.users.length).to.eq(10);
      });
    });
  });

  context("GET /users/:user_id", function() {
    it("get a user", function() {
      const { id, username } = this.currentUser;
      cy.apiLogin(username);

      cy.request("GET", `${apiUsers}/${id}`).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.user).to.have.property("first_name");
      });
    });

    it("error when invalid user_id", function() {
      const { username } = this.currentUser;
      cy.apiLogin(username);

      cy.request({
        method: "GET",
        url: `${apiUsers}/1234`,
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(422);
        expect(response.body.errors.length).to.eq(1);
      });
    });
  });

  context("GET /users/profile/:username", function() {
    it("get a user profile by username", function() {
      const { username, first_name, last_name, avatar } = this.currentUser;
      cy.apiLogin(username);
      cy.request("GET", `${apiUsers}/profile/${username}`).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.user).to.deep.equal({
          first_name: first_name,
          last_name: last_name,
          avatar: avatar
        });
        expect(response.body.user).not.to.have.property("balance");
      });
    });
  });

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
  });

  context("POST /login", function() {
    it("login as user", function() {
      cy.apiLogin(this.currentUser.username).then(response => {
        expect(response.status).to.eq(200);
      });
    });
  });
});
