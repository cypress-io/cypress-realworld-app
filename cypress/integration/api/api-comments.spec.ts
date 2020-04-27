// check this file using TypeScript if available
// @ts-check

import { User, Comment } from "../../../src/models";

const apiComments = `${Cypress.env("apiUrl")}/comments`;

type TestCommentsCtx = {
  allUsers?: User[];
  authenticatedUser?: User;
  transactionId?: string;
};

describe("Comments API", function () {
  let ctx: TestCommentsCtx = {};

  beforeEach(function () {
    cy.task("db:seed");

    cy.task("filter:testData", { entity: "users" }).then((users: User[]) => {
      ctx.authenticatedUser = users[0];
      ctx.allUsers = users;

      return cy.apiLogin(ctx.authenticatedUser.username);
    });

    cy.task("filter:testData", {
      entity: "comments",
    }).then((comments: Comment[]) => {
      ctx.transactionId = comments[0].transactionId;
    });
  });

  context("GET /comments/:transactionId", function () {
    it("gets a list of comments for a transaction", function () {
      cy.request("GET", `${apiComments}/${ctx.transactionId}`).then(
        (response) => {
          expect(response.status).to.eq(200);
          expect(response.body.comments.length).to.eq(1);
        }
      );
    });
  });

  context("POST /comments/:transactionId", function () {
    it("creates a new comment for a transaction", function () {
      cy.request("POST", `${apiComments}/${ctx.transactionId}`, {
        content: "This is my comment",
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.comment.id).to.be.a("string");
        expect(response.body.comment.content).to.be.a("string");
      });
    });
  });
});
