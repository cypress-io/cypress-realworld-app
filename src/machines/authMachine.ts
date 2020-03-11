import { Machine, assign } from "xstate";
import { omit } from "lodash/fp";
import { httpClient } from "../utils/asyncUtils";
import { history } from "../index";

export const authMachine = Machine(
  {
    id: "authentication",
    initial: "unauthorized",
    context: {},
    states: {
      unauthorized: {
        on: {
          LOGIN: "loading"
        }
      },
      loading: {
        invoke: {
          src: "performLogin",
          onDone: { target: "authorized", actions: ["onSuccess"] },
          onError: { target: "unauthorized", actions: "onError" }
        }
      },
      authorized: {
        invoke: {
          src: "getUserProfile",
          onDone: { actions: ["setUserProfile"] },
          onError: { actions: "onError" }
        },
        on: {
          LOGOUT: "unauthorized"
        }
      }
    }
  },
  {
    services: {
      performLogin: async (ctx, event) => {
        const payload = omit("type", event);
        const resp = await httpClient.post(
          `http://localhost:3001/login`,
          payload
        );
        return resp.data;
      },
      getUserProfile: async (ctx, event) => {
        const payload = omit("type", event);
        const resp = await httpClient.get(
          `http://localhost:3001/checkAuth`,
          payload
        );
        history.push("/");
        return resp.data;
      }
    },
    actions: {
      setUserProfile: assign((ctx: any, event: any) => ({
        user: event.data.user
      })),
      onSuccess: assign((ctx: any, event: any) => ({
        newLink: event.reverse ? "/" : null,
        errorMessage: null
      })),
      onError: assign((ctx: any, event: any) => ({
        newLink: event.reverse ? null : "/signin",
        errorMessage: event.errorMessage
      }))
    }
  }
);
