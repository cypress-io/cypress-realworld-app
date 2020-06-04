import { User, Transaction, Like, Comment } from "../../../../src/models";

type ExampleCtx = {
  users?: User[];
  user?: User;
  transaction?: Transaction;
  likes?: Like[];
  comments?: Comment[];
};

describe("User Transaction Tests", function () {
  // Learn more about the Context pattern in the Testing Approach & Organization Guide
  // Create a context object for holding data
  const ctx: ExampleCtx = {};

  beforeEach(function () {
    cy.task("db:seed");

    // Users created from our database seed
    cy.database("filter", "users").then((users: User[]) => {
      ctx.users = users;

      return cy.loginByXstate(ctx.users[0].username);
    });
  });

  it("Verifies transaction details between two users", function () {
    // Create a payment transaction between users from the spec context
    const transactionPayload = {
      transactionType: "payment",
      amount: 25,
      description: "Indian Food",
      senderId: ctx.users![0].id,
      receiverId: ctx.users![1].id,
      privacyLevel: "contacts",
    };

    cy.createExampleTransaction(transactionPayload)
      .then((transaction) => {
        // Add likes to the transaction on context for a list of users
        cy.addLikes(transaction, [ctx.users![3], ctx.users![4]]);

        // Add comment to the transaction on context for a list of users
        cy.addComments(transaction, [{ user: ctx.users![2], content: "thanks for dinner" }]);

        ctx.transaction = transaction;
      })
      .then(() => {
        cy.visit(`/transaction/${ctx.transaction!.id}`);
        //cy.get("[data-test=like-count]").should("have.text", "2");
        //cy.get("[data-test=comment-count]").should("have.text", "1");
      });
  });
});
