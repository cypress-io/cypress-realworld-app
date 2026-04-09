import { faker } from "@faker-js/faker";
import { User } from "../../../src/models";

const apiUsers = `${Cypress.env("apiUrl")}/users`;

type TestUserCtx = {
  authenticatedUser?: User;
  searchUser?: User;
};

describe("Users API", function () {
  let ctx: TestUserCtx = {};

  before(() => {
    // Hacky workaround to have the e2e tests pass when cy.visit('http://localhost:3000') is called
    cy.request("GET", "/");
  });

  beforeEach(function () {
    cy.task("db:seed");

    cy.database("filter", "users").then((users: User[]) => {
      ctx.authenticatedUser = users[0];
      ctx.searchUser = users[1];

      return cy.loginByApi(ctx.authenticatedUser.username);
    });
  });

  context("GET /users", function () {
    it("gets a list of users", function () {
      cy.request("GET", apiUsers).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.results).length.to.be.greaterThan(1);
      });
    });
  });

  context("GET /users/:userId", function () {
    it("gets a user", function () {
      cy.request("GET", `${apiUsers}/${ctx.authenticatedUser!.id}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.user).to.have.property("firstName");
      });
    });

    it("errors when invalid userId", function () {
      cy.request({
        method: "GET",
        url: `${apiUsers}/1234`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors.length).to.eq(1);
      });
    });
  });

  context("GET /users/profile/:username", function () {
    it("gets a user profile by username", function () {
      const { username, firstName, lastName, avatar } = ctx.authenticatedUser!;
      cy.request("GET", `${apiUsers}/profile/${username}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.user).to.deep.equal({
          firstName: firstName,
          lastName: lastName,
          avatar: avatar,
        });
        expect(response.body.user).not.to.have.property("balance");
      });
    });
  });

  context("GET /users/search", function () {
    it("gets users by email", function () {
      const { email, firstName } = ctx.searchUser!;
      cy.request({
        method: "GET",
        url: `${apiUsers}/search`,
        qs: { q: email },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.results[0]).to.contain({
          firstName: firstName,
        });
      });
    });

    it("gets users by phone number", function () {
      const { phoneNumber, firstName } = ctx.searchUser!;

      cy.request({
        method: "GET",
        url: `${apiUsers}/search`,
        qs: { q: phoneNumber },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.results[0]).to.contain({
          firstName,
        });
      });
    });

    it("gets users by username", function () {
      const { username, firstName } = ctx.searchUser!;

      cy.request({
        method: "GET",
        url: `${apiUsers}/search`,
        qs: { q: username },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.results[0]).to.contain({
          firstName,
        });
      });
    });
  });

  context("POST /users", function () {
    it("creates a new user", function () {
      const firstName = faker.name.firstName();

      cy.request("POST", `${apiUsers}`, {
        firstName,
        lastName: faker.name.lastName(),
        username: faker.internet.userName(),
        password: faker.internet.password(),
        email: faker.internet.email(),
        phoneNumber: faker.phone.phoneNumber(),
        avatar: faker.internet.avatar(),
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.user).to.contain({ firstName });
      });
    });

    it("creates a new user with an account balance in cents", function () {
      const firstName = faker.name.firstName();

      cy.request("POST", `${apiUsers}`, {
        firstName,
        lastName: faker.name.lastName(),
        username: faker.internet.userName(),
        password: faker.internet.password(),
        email: faker.internet.email(),
        phoneNumber: faker.phone.phoneNumber(),
        avatar: faker.internet.avatar(),
        balance: 100_00,
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.user).to.contain({ firstName });
        expect(response.body.user.balance).to.equal(100_00);
      });
    });

    it("errors when an invalid field sent", function () {
      cy.request({
        method: "POST",
        url: `${apiUsers}`,
        failOnStatusCode: false,
        body: {
          notAUserField: "not a user field",
        },
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors.length).to.eq(1);
      });
    });
  });

  context("PATCH /users/:userId", function () {
    it("updates a user", function () {
      const firstName = faker.name.firstName();

      cy.request("PATCH", `${apiUsers}/${ctx.authenticatedUser!.id}`, {
        firstName,
      }).then((response) => {
        expect(response.status).to.eq(204);
      });
    });

    it("errors when an invalid field sent", function () {
      cy.request({
        method: "PATCH",
        url: `${apiUsers}/${ctx.authenticatedUser!.id}`,
        failOnStatusCode: false,
        body: {
          notAUserField: "not a user field",
        },
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors.length).to.eq(1);
      });
    });
  });

  context("POST /login", function () {
    it("logs in as a user", function () {
      cy.loginByApi(ctx.authenticatedUser!.username).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });
});
