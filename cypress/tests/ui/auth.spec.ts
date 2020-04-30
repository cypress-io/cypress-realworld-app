// @ts-check
import { User } from "../../../src/models";

describe("User Sign-up and Login", function () {
  beforeEach(function () {
    cy.task("db:seed");

    cy.server();
    cy.route("POST", "/users").as("signup");
    cy.route("POST", "/bankAccounts").as("createBankAccount");
  });

  it("should remember a user for 30 days after login", function () {
    cy.task("find:testData", { entity: "users" }).then((user: User) => {
      cy.login(user.username, "s3cret", true);
    });

    // Verify Session Cookie
    cy.getCookie("connect.sid").should("have.property", "expiry");

    // Logout User
    cy.getTest("sidenav-signout").click();
    cy.location("pathname").should("eq", "/");
  });

  it("should allow a visitor to sign-up, login, and logout", function () {
    const userInfo = {
      firstName: "Bob",
      lastName: "Ross",
      username: "PainterJoy90",
      password: "s3cret",
    };

    // Sign-up User
    cy.visit("/");
    cy.getTest("signup").click();

    cy.getTest("signup-first-name").type(userInfo.firstName);
    cy.getTest("signup-last-name").type(userInfo.lastName);
    cy.getTest("signup-username").type(userInfo.username);
    cy.getTest("signup-password").type(userInfo.password);
    cy.getTest("signup-confirmPassword").type(userInfo.password);
    cy.getTest("signup-submit").click();
    cy.wait("@signup");

    // Login User
    cy.login(userInfo.username, userInfo.password);

    // Onboarding
    cy.getTest("user-onboarding-dialog").should("be.visible");
    cy.getTest("user-onboarding-next").click();

    cy.getTest("user-onboarding-dialog-title").should(
      "contain",
      "Create Bank Account"
    );

    cy.getTestLike("bankName-input").type("The Best Bank");
    cy.getTestLike("accountNumber-input").type("123456789");
    cy.getTestLike("routingNumber-input").type("987654321");
    cy.getTestLike("submit").click();

    cy.wait("@createBankAccount");

    cy.getTest("user-onboarding-dialog-title").should("contain", "Finished");
    cy.getTest("user-onboarding-dialog-content").should(
      "contain",
      "You're all set!"
    );
    cy.getTest("user-onboarding-next").click();

    cy.getTest("transaction-list").should("be.visible");

    // Logout User
    cy.getTest("sidenav-signout").click();
    cy.location("pathname").should("eq", "/");
  });

  it("should display login errors", function () {
    cy.visit("/");

    cy.getTest("signin-username").type("User").find("input").clear().blur();
    cy.get("#username-helper-text")
      .should("be.visible")
      .and("contain", "Username is required");

    cy.getTest("signin-password").type("abc").find("input").blur();
    cy.get("#password-helper-text")
      .should("be.visible")
      .and("contain", "Password must contain at least 4 characters");

    cy.getTest("signin-submit").should("be.disabled");
  });

  it("should display signup errors", function () {
    cy.visit("/signup");

    cy.getTest("signup-first-name").type("First").find("input").clear().blur();
    cy.get("#firstName-helper-text")
      .should("be.visible")
      .and("contain", "First Name is required");

    cy.getTest("signup-last-name").type("Last").find("input").clear().blur();
    cy.get("#lastName-helper-text")
      .should("be.visible")
      .and("contain", "Last Name is required");

    cy.getTest("signup-username").type("User").find("input").clear().blur();
    cy.get("#username-helper-text")
      .should("be.visible")
      .and("contain", "Username is required");

    cy.getTest("signup-password").type("password").find("input").clear().blur();
    cy.get("#password-helper-text")
      .should("be.visible")
      .and("contain", "Enter your password");

    cy.getTest("signup-confirmPassword")
      .type("DIFFERENT PASSWORD")
      .find("input")
      .blur();
    cy.get("#confirmPassword-helper-text")
      .should("be.visible")
      .and("contain", "Password does not match");

    cy.getTest("signup-submit").should("be.disabled");
  });
});
