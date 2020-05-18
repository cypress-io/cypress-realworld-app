import { Machine, assign, interpret, State } from "xstate";
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
    logout: {};
    refreshing: {};
    authorized: {};
  };
}

export type AuthMachineEvents =
  | { type: "LOGIN" }
  | { type: "LOGOUT" }
  | { type: "UPDATE" }
  | { type: "REFRESH" }
  | { type: "SIGNUP" };

export interface AuthMachineContext {
  user?: User;
  message?: string;
}

export const authMachine = Machine<AuthMachineContext, AuthMachineSchema, AuthMachineEvents>(
  {
    id: "authentication",
    initial: "unauthorized",
    context: {
      user: undefined,
      message: undefined,
    },
    states: {
      unauthorized: {
        entry: "resetUser",
        on: {
          LOGIN: "loading",
          SIGNUP: "signup",
        },
      },
      signup: {
        invoke: {
          src: "performSignup",
          onDone: { target: "unauthorized", actions: "onSuccess" },
          onError: { target: "unauthorized", actions: "onError" },
        },
      },
      loading: {
        invoke: {
          src: "performLogin",
          onDone: { target: "authorized", actions: "onSuccess" },
          onError: { target: "unauthorized", actions: "onError" },
        },
      },
      updating: {
        invoke: {
          src: "updateProfile",
          onDone: { target: "refreshing" },
          onError: { target: "unauthorized", actions: "onError" },
        },
      },
      refreshing: {
        invoke: {
          src: "getUserProfile",
          onDone: { target: "authorized", actions: "setUserProfile" },
          onError: { target: "unauthorized", actions: "onError" },
        },
      },
      logout: {
        invoke: {
          src: "performLogout",
          onDone: { target: "unauthorized" },
          onError: { target: "unauthorized", actions: "onError" },
        },
      },
      authorized: {
        entry: "redirectHomeAfterLogin",
        on: {
          UPDATE: "updating",
          REFRESH: "refreshing",
          LOGOUT: "logout",
        },
      },
    },
  },
  {
    services: {
      performSignup: async (ctx, event) => {
        const payload = omit("type", event);
        const resp = await httpClient.post(`http://localhost:3001/users`, payload);
        history.push("/signin");
        return resp.data;
      },
      performLogin: async (ctx, event) => {
        return await httpClient
          .post(`http://localhost:3001/login`, event)
          .then(({ data }) => {
            history.push("/");
            return data;
          })
          .catch((error) => {
            throw new Error("Username or password is invalid");
          });
      },
      getUserProfile: async (ctx, event) => {
        const resp = await httpClient.get(`http://localhost:3001/checkAuth`);
        return resp.data;
      },
      updateProfile: async (ctx, event: any) => {
        const payload = omit("type", event);
        const resp = await httpClient.patch(`http://localhost:3001/users/${payload.id}`, payload);
        return resp.data;
      },
      performLogout: async (ctx, event) => {
        localStorage.removeItem("authState");
        await httpClient.post(`http://localhost:3001/logout`);
      },
    },
    actions: {
      redirectHomeAfterLogin: async (ctx, event) => {
        if (history.location.pathname === "/signin") {
          // TODO: @kevinold: determine if this is necessary. This statement never runs.
          /* istanbul ignore next */
          window.location.pathname = "/";
        }
      },
      resetUser: assign((ctx: any, event: any) => ({
        user: undefined,
      })),
      setUserProfile: assign((ctx: any, event: any) => ({
        user: event.data.user,
      })),
      onSuccess: assign((ctx: any, event: any) => ({
        user: event.data.user,
        message: undefined,
      })),
      onError: assign((ctx: any, event: any) => ({
        message: event.data.message,
      })),
    },
  }
);

// @ts-ignore
const stateDefinition = JSON.parse(localStorage.getItem("authState"));

let resolvedState;
if (stateDefinition) {
  const previousState = State.create(stateDefinition);

  // @ts-ignore
  resolvedState = authMachine.resolveState(previousState);
}

export const authService = interpret(authMachine, { devTools: true })
  .onTransition((state) => {
    if (state.changed) {
      localStorage.setItem("authState", JSON.stringify(state));
    }
  })
  .start(resolvedState);
