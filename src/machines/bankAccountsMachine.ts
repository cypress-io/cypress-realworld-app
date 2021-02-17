import { isEmpty, omit } from "lodash/fp";
import { dataMachine } from "./dataMachine";
import { httpClient } from "../utils/asyncUtils";
import { BankAccountsApiFactory } from "cypress-realword-app-api";

const baApi = BankAccountsApiFactory(undefined, undefined, httpClient);

export const bankAccountsMachine2 = dataMachine("bankAccounts").withConfig({
  services: {
    fetchData: async (ctx, event: any) => {
      const payload = omit("type", event);
      if (!isEmpty(payload) && event.type === "FETCH") {
        const resp = await baApi.bankAccountsBankAccountIdGet(payload.id);
        console.log("KYPARK - fetchData resp: ", resp)
        return resp.data;
      } else {
        const resp = await baApi.bankAccountsGet();
        console.log("KYPARK - fetchData resp: ", resp)
        return resp.data;
      }
    },
    deleteData: async (ctx, event: any) => {
      const payload = omit("type", event);
      const resp = await baApi.bankAccountsBankAccountIdDelete(payload.id);
      console.log("KYPARK - deleteData resp: ", resp)
      return resp;
    },
    createData: async (ctx, event: any) => {
      const payload = omit("type", event);
      const resp = await baApi.bankAccountsPost(payload);
      console.log("KYPARK - createData resp: ", resp)
      return resp;
    },
  },
});

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
