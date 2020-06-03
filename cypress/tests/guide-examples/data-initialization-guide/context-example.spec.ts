import shortid from "shortid";
import faker from "faker";
import bcrypt from "bcryptjs";
import { times } from "lodash/fp";
import { User, Transaction, Like, Comment, DefaultPrivacyLevel } from "../../../../src/models";

type ExampleCtx = {
  users?: User[];
  user?: User;
  transaction?: Transaction;
  likes?: Like[];
  comments?: Comment[];
};

/*
export const passwordHash = bcrypt.hashSync("s3cret", 10);

export const createFakeUser = (): User => ({
  id: shortid(),
  uuid: faker.random.uuid(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  username: faker.internet.userName(),
  password: passwordHash,
  email: faker.internet.email(),
  phoneNumber: faker.phone.phoneNumberFormat(0),
  avatar: faker.internet.avatar(),
  defaultPrivacyLevel: faker.helpers.randomize([
    DefaultPrivacyLevel.public,
    DefaultPrivacyLevel.private,
    DefaultPrivacyLevel.contacts,
  ]),
  balance: faker.random.number({ min: 10000, max: 200000 }),
  createdAt: faker.date.past(),
  modifiedAt: faker.date.recent(),
});

export const createFakeUsers = (userCount: number) => times(() => createFakeUser(), userCount);

const exampleUsers = createFakeUsers(10);
*/

describe("User Transaction Tests", function () {
  // Learn more about the Context pattern in the Testing Approach & Organization Guide
  // Create a context object for holding data
  const ctx: ExampleCtx = {};

  beforeEach(function () {
    cy.task("db:seed");

    // Users created from our database seed
    cy.database("filter", "users").then((users: User[]) => {
      ctx.users = users;

      return cy.loginByApi(ctx.users[0].username);
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
    };

    cy.createExampleTransaction(transactionPayload).then((transaction) => {
      ctx.transaction = transaction;
    });

    // Add likes to the transaction on context for a list of users
    cy.addLikes(ctx.transaction, [ctx.users![9], ctx.users![7]]).then((likes: Like[]) => {
      ctx.likes = likes;
    });

    // Add comments to the transaction on context for a list of users
    cy.addComments(ctx.transaction, [{ user: ctx.users![8], content: "thanks for dinner" }]).then(
      (comments: Comment[]) => {
        ctx.comments = comments;
      }
    );

    // Login as users[0]
    // ...

    cy.get("[data-test=user-balance]").should("be.greaterThan", 10);
    // ...
  });
});
