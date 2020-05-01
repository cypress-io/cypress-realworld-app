// @ts-check
import { User } from "../../../src/models";

describe("User Settings", function () {
  beforeEach(function () {
    cy.task("db:seed");

    cy.server();
    cy.route("PATCH", "http://localhost:3001/users/*").as("updateUser");

    cy.task("find:testData", { entity: "users" }).then((user: User) => {
      cy.loginByXstate(user.username);
    });

    cy.getTest("sidenav-user-settings").click();
  });

  it("renders the user settings form", function () {
    cy.getTest("user-settings-form").should("be.visible");
    cy.location("pathname").should("include", "/user/settings");
  });

  it("should display user setting form errors", function () {
    ["first", "last"].forEach((field) => {
      cy.getTestLike(`${field}Name-input`)
        .type("Abc")
        .find("input")
        .clear()
        .blur();
      cy.get(`#user-settings-${field}Name-input-helper-text`)
        .should("be.visible")
        .and("contain", `Enter a ${field} name`);
    });

    cy.getTestLike("email-input").type("abc").find("input").clear().blur();
    cy.get("#user-settings-email-input-helper-text")
      .should("be.visible")
      .and("contain", "Enter an email address");

    cy.getTestLike("email-input").type("abc@bob.").find("input").blur();
    cy.get("#user-settings-email-input-helper-text")
      .should("be.visible")
      .and("contain", "Must contain a valid email address");

    cy.getTestLike("phoneNumber-input")
      .type("abc")
      .find("input")
      .clear()
      .blur();
    cy.get("#user-settings-phoneNumber-input-helper-text")
      .should("be.visible")
      .and("contain", "Enter a phone number");

    cy.getTestLike("phoneNumber-input").type("615-555-").find("input").blur();
    cy.get("#user-settings-phoneNumber-input-helper-text")
      .should("be.visible")
      .and("contain", "Phone number is not valid");

    cy.getTestLike("submit").should("be.disabled");
  });

  it("updates first name, last name, email and phone number", function () {
    cy.getTestLike("firstName").find("input").clear().type("New First Name");
    cy.getTestLike("lastName").find("input").clear().type("New Last Name");
    cy.getTestLike("email").find("input").clear().type("email@email.com");
    cy.getTestLike("phoneNumber-input")
      .find("input")
      .clear()
      .type("6155551212")
      .blur();

    cy.getTestLike("submit").should("not.be.disabled");
    cy.getTestLike("submit").click();

    cy.wait("@updateUser").its("status").should("equal", 204);
  });
});
