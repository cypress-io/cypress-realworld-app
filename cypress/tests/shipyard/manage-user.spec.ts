import { User } from "models";

describe("Create new user", function () {
  beforeEach(function () {
    //console.log(process.env.SHIPYARD_DOMAIN_FRONTEND)
    const urlToVisit = "/signup";
    cy.visit(urlToVisit);
    cy.url().then((url) => {
      cy.log(`Current URL: ${url}`);
    });
    //cy.task("db:seed");
  });
  // go to sign up page and register
  it("should create a new user", function () {
    //cy.visit('/signup')
    // tracking using a random ID
    const userId = Cypress._.random(1000, 9999);
    const username = `user${userId}`;
    const firstName = `Name${userId}`
    const lastName = `T${userId}`
    cy.get("input[name='username']").type(username);
    cy.get("input[name='firstName']").type(firstName);
    cy.get("input[name='lastName']").type(lastName);
    // only field that really matters is username because uses ID
    // maybe we track user by the auto assigned ID instead of username?
    cy.get("input[name='password']").type("testingPwd");
    cy.get("input[name='confirmPassword']").type("testingPwd");

    // add user to db
    cy.get("button[type='submit']").click();

    // want to change this to check for most recent entry, but stuck
    // adds the user to the middle of the db
    // maybe we sort db by date-created field
    cy.database("find", "users", { username: username }).then((user: User) => {
      expect(user.username).to.equal(username);
    });
  });
});

describe("Edit existing user", function () {
    const testEmail = "Norene39@yahoo.com"
    beforeEach(function () {
      const urlToVisit = "/";
      cy.visit(urlToVisit);
      //cy.task("db:seed");

      cy.intercept("PATCH", "/users/*").as("updateUser");
      cy.intercept("GET", "/notifications*").as("getNotifications");
      
      cy.database("find", "users", { email: testEmail }).then((user) => {
        if (user) {
          cy.loginByXstate(user.username);
        }
      });

      cy.getBySel("sidenav-user-settings").click();

    });
    it("should edit an existing user", function () {
      cy.visit('/user/settings')
      // tracking using a random ID
      const userId = Cypress._.random(1000, 9999);
      const newName = `Name${userId}`
      const newLast = `T${userId}`
      const newEmail = `${newName}@gmail.com`
      const newNumber = "415-555-8992"
      // clear fields
      cy.get("input[name='firstName']").clear();
      cy.get("input[name='lastName']").clear();
      cy.get("input[name='email']").clear();
      cy.get("input[name='phoneNumber']").clear();  
      // type inputs
      cy.get("input[name='firstName']").type(newName);
      cy.get("input[name='lastName']").type(newLast);
      cy.get("input[name='email']").type(newEmail);
      cy.get("input[name='phoneNumber']").type(newNumber);  
      // edit user in db
      cy.get("button[type='submit']").click();
  
      cy.database("find", "users", { email: newEmail })
      .then((user: User) => {
        if (user) {
          cy.log(`Found user with email: ${user.email}`);
          expect(user.email).to.equal(newEmail);
          expect(user.firstName).to.equal(newName);
          expect(user.lastName).to.equal(newLast);
          expect(user.phoneNumber).to.equal(newNumber);
        } else {
          cy.log(`User with email "${testEmail}" not found in the database.`);
        }
      })
    });
  });
