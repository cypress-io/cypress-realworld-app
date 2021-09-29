import * as React from "react";
import { mount } from "@cypress/react";
import TransactionTitle from "./TransactionTitle";

it("Transaction Title", () => {
  cy.fixture("public-transactions").then((transactions) => {
    mount(<TransactionTitle transaction={transactions[0]} />);
    cy.get("[data-test=transaction-sender-*]").should("exist");
  });
});
