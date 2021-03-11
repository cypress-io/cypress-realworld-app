import { isEmpty, omit } from "lodash/fp";
import { dataMachine } from "./dataMachine";
import { httpClient } from "../utils/asyncUtils";

require("dotenv").config();

const backendPort = process.env.BACKEND_PORT || 3001;

export const usersMachine = dataMachine("users").withConfig({
  services: {
    fetchData: async (ctx, event: any) => {
      const payload = omit("type", event);
      let route = isEmpty(payload) ? "users" : "users/search";
      const resp = await httpClient.get(`http://localhost:${backendPort}/${route}`, {
        params: !isEmpty(payload) ? payload : undefined,
      });
      return resp.data;
    },
  },
});
