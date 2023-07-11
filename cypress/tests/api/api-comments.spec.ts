// check this file using TypeScript if available
// @ts-check

import { User, Comment } from "../../../src/models";

const apiComments = `${Cypress.env("apiUrl")}/comments`;

type TestCommentsCtx = {
  authenticatedUser?: User;
  transactionId?: string;
};

describe("Comments API", function () {
  let ctx: TestCommentsCtx = {};

  before(() => {
    // Hacky workaround to have the e2e tests pass when cy.visit('http://localhost:3000') is called
    cy.request("GET", "/");
  });

  beforeEach(function () {
    cy.task("db:seed");

    cy.database("filter", "users").then((users: User[]) => {
      ctx.authenticatedUser = users[0];

      return cy.loginByApi(ctx.authenticatedUser.username);
    });

    cy.database("find", "comments").then((comment: Comment) => {
      ctx.transactionId = comment.transactionId;
    });
  });

  context("GET /comments/:transactionId", function () {
    it("gets a list of comments for a transaction", function () {
      cy.request("GET", `${apiComments}/${ctx.transactionId}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.comments.length).to.eq(1);
      });
    });
  });

  context("POST /comments/:transactionId", function () {
    it("creates a new comment for a transaction", function () {
      cy.request("POST", `${apiComments}/${ctx.transactionId}`, {
        content: "This is my comment",
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });
});
