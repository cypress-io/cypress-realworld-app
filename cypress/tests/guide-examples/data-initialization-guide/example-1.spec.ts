import { User } from "../../../../src/models";
import { createSeedUsers } from "../../../../scripts/seedDataUtils";

const exampleUsers = createSeedUsers(10);

it("Verifies transaction details between two users", function () {
  cy.createExampleUsers(exampleUsers).then((users: User[]) => {
    const transactionPayload = {
      transactionType: "payment",
      amount: 25,
      description: "Indian Food",
      sender: users[0],
      receiver: users[1],
    };

    cy.createExampleTransaction(transactionPayload);

    // Login as user[0]
    // ...

    //cy.database("filter", "users").then((users) => { })
    // don't -- cy.get("[data-test=user-balance]").should("be.greaterThan", 10)
    // ...
  });
});
