// type definitions for Cypress object "cy"
/// <reference types="cypress" />

// check this file using TypeScript if available
// @ts-check

const faker = require("faker");

describe("Users API", function() {
  before(function() {
    //cy.task("db:reset");
    cy.task("db:seed");
  });

  afterEach(function() {
    //cy.task("db:reset");
    cy.task("db:seed");
  });

  context("GET /users", function() {
    it("gets a list of users", function() {
      cy.request("GET", "http://localhost:3001/users").then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.users.length).to.eq(10);
      });
    });
  });

  context("POST /users", function() {
    it("creates a new user", function() {
      const first_name = faker.name.firstName();

      cy.request("POST", "http://localhost:3001/users", {
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
      cy.request("GET", "http://localhost:3001/users").as("users");

      cy.get("@users").then(resp => {
        cy.log(resp.body.users);
        const user = resp.body.users[0];

        cy.request("PATCH", `http://localhost:3001/users/${user.id}`, {
          first_name
        }).then(response => {
          expect(response.status).to.eq(204);
          //expect(response.body).to.contain({ first_name });
        });
      });
    });
  });
});
