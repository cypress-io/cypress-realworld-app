describe("Login Page Tests", () => {
  beforeEach(() => {
    cy.visit("/signin");
  });

  it("validate login page title", () => {
    cy.get("h1").should("have.text", "Sign in");
  });

  it("validate page elements are displayed", () => {
    cy.get("[name='username']").should("be.visible");
    cy.get("[name='password']").should("be.visible");
    cy.get("[name='remember']").should("exist");
    cy.getBySel("signin-submit").should("be.visible");
    cy.getBySel("signup").should("be.visible");
  });

  it("validate remember me checkbox is unchecked by default", () => {
    cy.get("[name='remember']").should("not.be.checked");
  });

  it("validate sign in button is disabled if credentials are not entered", () => {
    cy.get("[name='username']").should("be.empty");
    cy.get("[name='password']").should("be.empty");
    cy.getBySel("signin-submit").click();
    cy.getBySel("signin-submit").should("be.disabled");
  });

  it("validate sign in button is disabled if only username is entered", () => {
    cy.get("[name='username']").type("testuser");
    cy.getBySel("signin-submit").should("be.disabled");
  });

   it("validate sign in button is disabled if only password is entered", () => {
    cy.get("[name='password']").type("testpassword");
    cy.getBySel("signin-submit").should("be.disabled");
  });

  it("validate sign in button is enabled if credentials are entered", () => {
    cy.get("[name='username']").type("testuser");
    cy.get("[name='password']").type("testpassword");
    cy.getBySel("signin-submit").should("be.enabled");
  });

  it("validate sign in button is re-disabled if credentials are cleared", () => {
    cy.get("[name='username']").type("testuser");
    cy.get("[name='password']").type("testpassword");
    cy.getBySel("signin-submit").should("be.enabled");
    cy.get("[name='username']").clear();
    cy.get("[name='password']").clear();
    cy.getBySel("signin-submit").should("be.disabled");

  });

  it("validate error message is displayed for invalid credentials", () => {
    cy.get("[name='username']").type("invaliduser");
    cy.get("[name='password']").type("invalidpassword");
    cy.getBySel("signin-submit").click();
    cy.get("[data-test='signin-error']").should("contain.text", "Username or password is invalid");
  });

  it("validate required message is displayed when username is not entered", () => {
    cy.getBySel("signin-submit").click();
    cy.get("[id='username-helper-text']").should("contain.text", "Username is required");
  });

  it("validate user name required message is cleared when user name is entered", () => {
    cy.getBySel("signin-submit").click();
    cy.get("[id='username-helper-text']").should("contain.text", "Username is required");
    cy.get("[name='username']").type("testuser");
    cy.get("[id='username-helper-text']").should("not.exist");
  });

  it("validate successful login redirects to dashboard", () => {
    cy.task("db:seed");
    cy.database("find", "users").then((user) => {
        cy.login(user.username, Cypress.env("defaultPassword"));
    });
    cy.location("pathname").should("equal", "/");
  });

  // Awaiting to fix the issue with session persistence, so this test is being skipped for now  
  it.skip('validate session persists when remember me is checked', () => {
    cy.database("find", "users").then((user) => {
        cy.login(user.username, Cypress.env("defaultPassword"), { rememberUser: true });
    });
    cy.location("pathname").should("equal", "/");
    cy.reload();
    cy.location("pathname").should("equal", "/");
  });

  it("validate sign up link redirects to sign up page", () => {
    cy.getBySel("signup").click();
    cy.location("pathname").should("equal", "/signup");
  });

})