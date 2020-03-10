import { dataMachine } from "./dataMachine";
import axios from "axios";
import { isEmpty, omit } from "lodash/fp";

export const personalTransactionsMachine = dataMachine(
  "personalTransactions"
).withConfig({
  services: {
    fetchData: async (ctx, event: any) => {
      const payload = omit("type", event);
      const resp = await axios
        .create({ withCredentials: true })
        .get(`http://localhost:3001/transactions`, {
          params: !isEmpty(payload) ? payload : undefined
        });
      return resp.data;
    }
  }
});
