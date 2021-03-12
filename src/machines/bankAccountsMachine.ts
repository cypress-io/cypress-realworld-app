import { isEmpty, omit } from "lodash/fp";
import { dataMachine } from "./dataMachine";
import { httpClient } from "../utils/asyncUtils";

export const bankAccountsMachine = dataMachine("bankAccounts").withConfig({
  services: {
    fetchData: async (ctx, event: any) => {
      const payload = omit("type", event);
      const resp = await httpClient.get(`http://localhost:3001/bankAccounts`, {
        params: !isEmpty(payload) && event.type === "FETCH" ? payload : undefined,
      });
      return resp.data;
    },
    deleteData: async (ctx, event: any) => {
      const payload = omit("type", event);
      const resp = await httpClient.delete(
        `http://localhost:3001/bankAccounts/${payload.id}`,
        payload
      );
      return resp.data;
    },
    createData: async (ctx, event: any) => {
      const payload = omit("type", event);
      const resp = await httpClient.post("http://localhost:3001/bankAccounts", payload);
      return resp.data;
    },
  },
});
