import { User, Contact } from "../../../src/models";

const apiContacts = `${Cypress.env("apiUrl")}/contacts`;

type TestContactsCtx = {
  allUsers?: User[];
  authenticatedUser?: User;
  contact?: Contact;
};
describe("Contacts API", function () {
  let ctx: TestContactsCtx = {};

  before(() => {
    // Hacky workaround to have the e2e tests pass when cy.visit('http://localhost:3000') is called
    cy.request("GET", "/");
  });

  beforeEach(function () {
    cy.task("db:seed");

    cy.database("filter", "users").then((users: User[]) => {
      ctx.authenticatedUser = users[0];
      ctx.allUsers = users;

      return cy.loginByApi(ctx.authenticatedUser.username);
    });

    cy.database("find", "contacts").then((contact: Contact) => {
      ctx.contact = contact;
    });
  });

  context("GET /contacts/:username", function () {
    it("gets a list of contacts by username", function () {
      const { username } = ctx.authenticatedUser!;
      cy.request("GET", `${apiContacts}/${username}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.contacts[0]).to.have.property("userId");
      });
    });
  });

  context("POST /contacts", function () {
    it("creates a new contact", function () {
      const { id: userId } = ctx.authenticatedUser!;

      cy.request("POST", `${apiContacts}`, {
        contactUserId: ctx.contact!.id,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.contact.id).to.be.a("string");
        expect(response.body.contact.userId).to.eq(userId);
      });
    });

    it("errors when invalid contactUserId", function () {
      cy.request({
        method: "POST",
        url: `${apiContacts}`,
        failOnStatusCode: false,
        body: {
          contactUserId: "1234",
        },
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.errors).to.be.an("array").that.has.length(1);
      });
    });
  });
  context("DELETE /contacts/:contactId", function () {
    it("deletes a contact", function () {
      cy.request("DELETE", `${apiContacts}/${ctx.contact!.id}`).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });
});
