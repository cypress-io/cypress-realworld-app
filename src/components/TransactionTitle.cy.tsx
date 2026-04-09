import * as React from "react";
import TransactionTitle from "./TransactionTitle";

it("Transaction Title", () => {
  cy.fixture("public-transactions.json").then((transactions) => {
    const transaction = transactions.results[0];
    cy.mount(<TransactionTitle transaction={transaction} />);
    cy.get("[data-test*=transaction-sender]").should("contain", transaction.senderName);
  });
});
