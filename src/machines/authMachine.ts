import { Machine, assign } from "xstate";
import { omit } from "lodash/fp";
import { httpClient } from "../utils/asyncUtils";
import { history } from "../index";
import { User } from "../models";

export interface AuthMachineSchema {
  states: {
    unauthorized: {};
    signup: {};
    loading: {};
    updating: {};
    authorized: {};
  };
}

export type AuthMachineEvents =
  | { type: "LOGIN" }
  | { type: "LOGOUT" }
  | { type: "UPDATE" }
  | { type: "SIGNUP" };

export interface AuthMachineContext {
  user?: User;
}

export const authMachine = Machine<
  AuthMachineContext,
  AuthMachineSchema,
  AuthMachineEvents
>(
  {
    id: "authentication",
    initial: "unauthorized",
    context: {},
    states: {
      unauthorized: {
        on: {
          LOGIN: "loading",
          SIGNUP: "signup"
        }
      },
      signup: {
        invoke: {
          src: "performSignup",
          onDone: { target: "authorized", actions: ["onSuccess"] },
          onError: { target: "unauthorized", actions: "onError" }
        }
      },
      loading: {
        invoke: {
          src: "performLogin",
          onDone: { target: "authorized", actions: ["onSuccess"] },
          onError: { target: "unauthorized", actions: "onError" }
        }
      },
      updating: {
        invoke: {
          src: "updateProfile",
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
          UPDATE: "updating",
          LOGOUT: "unauthorized"
        }
      }
    }
  },
  {
    services: {
      performSignup: async (ctx, event) => {
        const payload = omit("type", event);
        const resp = await httpClient.post(
          `http://localhost:3001/users`,
          payload
        );
        history.push("/");
        return resp.data;
      },
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
      },
      updateProfile: async (ctx, event: any) => {
        const payload = omit("type", event);
        const resp = await httpClient.patch(
          `http://localhost:3001/users/${payload.id}`,
          payload
        );
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
