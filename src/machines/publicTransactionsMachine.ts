import { dataMachine } from "./dataMachine";
import { httpClient } from "../utils/asyncUtils";
import { isEmpty, omit } from "lodash/fp";

require("dotenv").config();

const backendPort = process.env.BACKEND_PORT || 3001;

export const publicTransactionsMachine = dataMachine("publicTransactions").withConfig({
  services: {
    fetchData: async (ctx, event: any) => {
      const payload = omit("type", event);
      const resp = await httpClient.get(`http://localhost:${backendPort}/transactions/public`, {
        params: !isEmpty(payload) ? payload : undefined,
      });

      // in order to introduce flake sometimes we'll throw an error
      // which represents a potential source of flake when modifying real data
      if (Math.round(Math.random())) {
        throw new Error("FLAKE");
      }

      return resp.data;
    },
  },
});
