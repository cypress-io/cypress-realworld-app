import { User } from "../../../../src/models";

type ExampleCtx = {
  allUsers?: User[];
  user?: User;
};

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

describe("Public Transactions", function () {
  const ctx: ExampleCtx = {};

  beforeEach(function () {
    cy.task("db:seed");

    cy.server();
    cy.route("/transactions/public*").as("publicTransactions");

    cy.database("filter", "users").then((users: User[]) => {
      ctx.user = users[0];
      ctx.allUsers = users;

      cy.loginByXstate(ctx.user.username);
    });
  });
  it("renders a list of public transactions", function () {
    cy.on("win:before:load", (win) => {
      //win.initialPublicTransactionContext = initialPublicTransactionContext;
      Object.defineProperty(win, "initialPublicTransactionContext", {
        value: initialPublicTransactionContext,
      });
    });
    cy.getBySelLike("transaction-item").should("have.length", 1);

    //cy.wait(7000);

    cy.wait("@publicTransactions");

    /*
    // Doesn't work :(
    cy.window().then((win) => {
      // @ts-ignore
      win.publicTransactionMachine.withContext({
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
      });

      cy.getBySel("transaction-list").children().should("have.length", 1);
    });
    */
  });
});
