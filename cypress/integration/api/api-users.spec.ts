// check this file using TypeScript if available
// @ts-check

import faker from "faker";

const apiUsers = `${Cypress.env("apiUrl")}/users`;

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
        expect(response.body.results.length).to.eq(10);
      });
    });
  });

  context("GET /users/:userId", function() {
    it("get a user", function() {
      const { id, username } = this.currentUser;
      cy.apiLogin(username);

      cy.request("GET", `${apiUsers}/${id}`).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.user).to.have.property("firstName");
      });
    });

    it("error when invalid userId", function() {
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
      const { username, firstName, lastName, avatar } = this.currentUser;
      cy.apiLogin(username);
      cy.request("GET", `${apiUsers}/profile/${username}`).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.user).to.deep.equal({
          firstName: firstName,
          lastName: lastName,
          avatar: avatar
        });
        expect(response.body.user).not.to.have.property("balance");
      });
    });
  });

  context("GET /users/search", function() {
    it("get users by email", function() {
      const { username, email, firstName } = this.currentUser;
      cy.log(this.currentUser);
      cy.apiLogin(username);

      cy.request({
        method: "GET",
        url: `${apiUsers}/search`,
        qs: { q: email }
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.results[0]).to.contain({
          firstName
        });
      });
    });

    it("get users by phone number", function() {
      const { username, firstName } = this.currentUser;
      cy.apiLogin(username);

      cy.request({
        method: "GET",
        url: `${apiUsers}/search`,
        qs: { q: "+12133734253" }
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.results[0]).to.contain({
          firstName
        });
      });
    });

    it("get users by username", function() {
      const { username, firstName } = this.currentUser;
      cy.apiLogin(username);

      cy.request({
        method: "GET",
        url: `${apiUsers}/search`,
        qs: { q: username }
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.results[0]).to.contain({
          firstName
        });
      });
    });
  });

  context("POST /users", function() {
    it("creates a new user", function() {
      const firstName = faker.name.firstName();

      cy.request("POST", `${apiUsers}`, {
        firstName,
        lastName: faker.name.lastName(),
        username: faker.internet.userName(),
        password: faker.internet.password(),
        email: faker.internet.email(),
        phoneNumber: faker.phone.phoneNumber(),
        avatar: faker.internet.avatar()
      }).then(response => {
        expect(response.status).to.eq(201);
        expect(response.body.user).to.contain({ firstName });
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

  context("PATCH /users/:userId", function() {
    it("updates a user", function() {
      const firstName = faker.name.firstName();
      const { id, username } = this.currentUser;
      cy.apiLogin(username);

      cy.request("PATCH", `${apiUsers}/${id}`, {
        firstName
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

  context("POST /login", function() {
    it("login as user", function() {
      cy.apiLogin(this.currentUser.username).then(response => {
        expect(response.status).to.eq(200);
      });
    });
  });
});
