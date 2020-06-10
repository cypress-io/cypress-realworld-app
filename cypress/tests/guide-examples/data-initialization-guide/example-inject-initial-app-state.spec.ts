import { User } from "../../../../src/models";

const initialPublicTransactionContext = {
  pageData: {
    hasNextPages: false,
    limit: 10,
    page: 1,
    totalPages: 1,
  },
  results: [
    {
      amount: 8647,
      balanceAtCompletion: 8958,
      createdAt: "2019-12-10T21:38:16.311Z",
      description: "Payment: db4uxOm7d to IMbeyzHTj9",
      id: "si_aNEMbyCA",
      modifiedAt: "2020-05-06T08:15:48.263Z",
      privacyLevel: "private",
      receiverId: "IMbeyzHTj9",
      requestResolvedAt: "2020-06-09T19:01:15.675Z",
      requestStatus: "",
      senderId: "db4uxOm7d",
      source: "GYDJUNEaOK7",
      status: "complete",
      uuid: "41754166-ea5b-448a-9a8a-374ce387c714",
      receiverName: "Kevin",
      senderName: "Amir",
      likes: [],
      comments: [],
    },
  ],
};

Cypress.on("window:before:load", (win) => {
  // @ts-ignore
  win.initialPublicTransactionContext = initialPublicTransactionContext;
});

describe("Public Transactions", function () {
  beforeEach(function () {
    cy.task("db:seed");

    cy.database("filter", "users").then((users: User[]) => {
      cy.loginByXstate(users[0].username);
    });
  });
  it("renders a list of public transactions with injected state", function () {
    cy.getBySelLike("transaction-item").should("have.length", 1);
  });
});
