import { dataMachine } from "./dataMachine";
import axios from "axios";
import { isEmpty, omit } from "lodash/fp";

let initialContext = undefined;

const fetchPublicTransactionsData = async (ctx: any, event: any) => {
  const payload = omit("type", event);
  const resp = await axios
    .create({ withCredentials: true })
    .get(`http://localhost:3001/transactions/public`, {
      params: !isEmpty(payload) ? payload : undefined,
    });
  return resp.data;
};

// @ts-ignore
if (window.Cypress) {
  // @ts-ignore
  if (window.initialPublicTransactionContext) {
    // @ts-ignore
    initialContext = window.initialPublicTransactionContext;
  }
}

export const publicTransactionsMachine = dataMachine(
  "publicTransactions",
  initialContext
).withConfig({
  services: {
    fetchData: fetchPublicTransactionsData,
  },
});

export default { fetchPublicTransactionsData };
