// @ts-check
import { User } from "../../src/models";

describe("User Settings", function () {
  beforeEach(function () {
    cy.task("db:seed");

    cy.server();
    cy.route("PATCH", "http://localhost:3001/users/*").as("updateUser");

    cy.task("find:testData", { entity: "users" }).then((user: User) => {
      cy.directLogin(user.username);
    });

    cy.getTest("sidenav-user-settings").click();
  });

  it("renders the user settings form", function () {
    cy.getTest("user-settings-form").should("be.visible");
    cy.location("pathname").should("include", "/user/settings");
  });

  it("updates first name, last name, email and phone number", function () {
    cy.getTestLike("firstName").find("input").clear().type("New First Name");
    cy.getTestLike("lastName").find("input").clear().type("New Last Name");
    cy.getTestLike("email").find("input").clear().type("email@email.com");
    cy.getTestLike("phoneNumber").find("input").clear().type("6155551212");
    cy.getTestLike("submit").click();

    cy.wait("@updateUser").its("status").should("equal", 204);
  });
});
