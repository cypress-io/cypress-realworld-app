import { dataMachine } from "./dataMachine";
import axios from "axios";

export const contactsTransactionsMachine = dataMachine(
  "contactsTransactions"
).withConfig({
  services: {
    fetchData: async () => {
      const resp = await axios
        .create({ withCredentials: true })
        .get(`http://localhost:3001/transactions/contacts`);
      return resp.data;
    }
  }
});
