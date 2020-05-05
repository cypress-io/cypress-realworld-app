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

    cy.getBySel("sidenav-user-settings").click();
  });

  it("renders the user settings form", function () {
    cy.getBySel("user-settings-form").should("be.visible");
    cy.location("pathname").should("include", "/user/settings");
  });

  it("should display user setting form errors", function () {
    ["first", "last"].forEach((field) => {
      cy.getBySelLike(`${field}Name-input`)
        .type("Abc")
        .find("input")
        .clear()
        .blur();
      cy.get(`#user-settings-${field}Name-input-helper-text`)
        .should("be.visible")
        .and("contain", `Enter a ${field} name`);
    });

    cy.getBySelLike("email-input").type("abc").find("input").clear().blur();
    cy.get("#user-settings-email-input-helper-text")
      .should("be.visible")
      .and("contain", "Enter an email address");

    cy.getBySelLike("email-input").type("abc@bob.").find("input").blur();
    cy.get("#user-settings-email-input-helper-text")
      .should("be.visible")
      .and("contain", "Must contain a valid email address");

    cy.getBySelLike("phoneNumber-input")
      .type("abc")
      .find("input")
      .clear()
      .blur();
    cy.get("#user-settings-phoneNumber-input-helper-text")
      .should("be.visible")
      .and("contain", "Enter a phone number");

    cy.getBySelLike("phoneNumber-input").type("615-555-").find("input").blur();
    cy.get("#user-settings-phoneNumber-input-helper-text")
      .should("be.visible")
      .and("contain", "Phone number is not valid");

    cy.getBySelLike("submit").should("be.disabled");
  });

  it("updates first name, last name, email and phone number", function () {
    cy.getBySelLike("firstName").find("input").clear().type("New First Name");
    cy.getBySelLike("lastName").find("input").clear().type("New Last Name");
    cy.getBySelLike("email").find("input").clear().type("email@email.com");
    cy.getBySelLike("phoneNumber-input")
      .find("input")
      .clear()
      .type("6155551212")
      .blur();

    cy.getBySelLike("submit").should("not.be.disabled");
    cy.getBySelLike("submit").click();

    cy.wait("@updateUser").its("status").should("equal", 204);
  });
});
