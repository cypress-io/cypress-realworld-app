import { dataMachine } from "./dataMachine";
import axios from "axios";
import { isEmpty, omit } from "lodash/fp";

const httpClient = axios.create({ withCredentials: true });

export const notificationsMachine = dataMachine("notifications").withConfig({
  services: {
    fetchData: async (ctx, event: any) => {
      const payload = omit("type", event);
      const resp = await httpClient.get(`http://localhost:3001/notifications`, {
        params: !isEmpty(payload) ? payload : undefined
      });
      return resp.data;
    },
    updateData: async (ctx, event: any) => {
      const payload = omit("type", event);
      const resp = await httpClient.patch(
        `http://localhost:3001/notifications/${payload.id}`,
        payload
      );
      return resp.data;
    }
  }
});
