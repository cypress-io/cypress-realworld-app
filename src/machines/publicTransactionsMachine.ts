import { dataMachine } from "./dataMachine";
import axios from "axios";
import { isEmpty, omit } from "lodash/fp";

// Implement as separate method so that cy.stub can be used from test to mock data
const fetchData = async (ctx, event: any) => {
  const payload = omit("type", event);
  const resp = await axios
    .create({ withCredentials: true })
    .get(`http://localhost:3001/transactions/public`, {
      params: !isEmpty(payload) ? payload : undefined,
    });
  return resp.data;
};

// @ts-ignore
/*
if (window.Cypress) {
  // @ts-ignore
  window.fetchPublicTransactions = fetchData;
}
*/

/* in test
// @ts-ignore
const createFakeTransactions = (transactionCount) => {
  //
};
const fakeTransactionData = () => createFakeTransactions(10);

Cypress.on("win:before:load", (win) => {
  cy.stub(win, "fetchPublicTransactions", fakeTransactionData);
});
cy.visit("/")

cy.window().its("fetchPublicTransactions").should("have.callCount", 1);
cy.window().its("fetchPublicTransactions").should("have.length", 10);
*/

export const publicTransactionsMachine = dataMachine("publicTransactions").withConfig({
  services: {
    fetchData,
  },
});
