import { omit, flow, first, isEmpty } from "lodash/fp";
import { dataMachine } from "./dataMachine";
import { httpClient } from "../utils/asyncUtils";
import { backendPort } from "../utils/portUtils";

export const transactionDetailMachine = dataMachine("transactionData").withConfig({
  services: {
    fetchData: async (ctx, event: any) => {
      const payload = omit("type", event);
      const contextTransactionId = !isEmpty(ctx.results) && first(ctx.results)["id"];
      const transactionId = contextTransactionId || payload.transactionId;
      const resp = await httpClient.get(
        `http://localhost:${backendPort}/transactions/${transactionId}`
      );
      return { results: [resp.data.transaction] };
    },
    createData: async (ctx, event: any) => {
      let route = event.entity === "LIKE" ? "likes" : "comments";
      const payload = flow(omit("type"), omit("entity"))(event);
      const resp = await httpClient.post(
        `http://localhost:${backendPort}/${route}/${payload.transactionId}`,
        payload
      );
      return resp.data;
    },
    updateData: async (ctx, event: any) => {
      const payload = omit("type", event);
      const contextTransactionId = !isEmpty(ctx.results) && first(ctx.results)["id"];
      const transactionId = contextTransactionId || payload.id;
      const resp = await httpClient.patch(
        `http://localhost:${backendPort}/transactions/${transactionId}`,
        payload
      );
      return resp.data;
    },
  },
});
