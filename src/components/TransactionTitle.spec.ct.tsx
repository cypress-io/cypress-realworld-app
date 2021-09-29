import * as React from "react";
import { mount } from "@cypress/react";
import TransactionTitle from "./TransactionTitle";

it("Transaction Title", () => {
  const testTransaction = {
    id: 1,
    likes: [],
    comments: [],
    receiverName: "Kevin",
    receiverAvatar: "",
    senderName: "Amir",
    senderAvatar: "",
  };
  mount(<TransactionTitle transaction={testTransaction} />);
  cy.get("[data-test*=transaction-sender]").should("contain", testTransaction.senderName);
});
