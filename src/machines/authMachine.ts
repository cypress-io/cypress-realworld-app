import dotenv from "dotenv";
import { Machine, assign, interpret, State } from "xstate";
import { omit } from "lodash/fp";
import { httpClient } from "../utils/asyncUtils";
import { history } from "../utils/historyUtils";
import { User } from "../models";
import { backendPort } from "../utils/portUtils";

dotenv.config();
export interface AuthMachineSchema {
  states: {
    unauthorized: {};
    signup: {};
    loading: {};
    updating: {};
    logout: {};
    refreshing: {};
    google: {};
    authorized: {};
    auth0: {};
    cognito: {};
    okta: {};
  };
}

export type AuthMachineEvents =
  | { type: "LOGIN" }
  | { type: "LOGOUT" }
  | { type: "UPDATE" }
  | { type: "REFRESH" }
  | { type: "AUTH0" }
  | { type: "COGNITO" }
  | { type: "OKTA" }
  | { type: "GOOGLE" }
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
          GOOGLE: "google",
          AUTH0: "auth0",
          OKTA: "okta",
          COGNITO: "cognito",
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
        on: {
          LOGOUT: "logout",
        },
      },
      google: {
        invoke: {
          src: "getGoogleUserProfile",
          onDone: { target: "authorized", actions: "setUserProfile" },
          onError: { target: "unauthorized", actions: "onError" },
        },
        on: {
          LOGOUT: "logout",
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
      auth0: {
        invoke: {
          src: "getAuth0UserProfile",
          onDone: { target: "authorized", actions: "setUserProfile" },
          onError: { target: "unauthorized", actions: "onError" },
        },
        on: {
          LOGOUT: "logout",
        },
      },
      okta: {
        invoke: {
          src: "getOktaUserProfile",
          onDone: { target: "authorized", actions: "setUserProfile" },
          onError: { target: "unauthorized", actions: "onError" },
        },
        on: {
          LOGOUT: "logout",
        },
      },
      cognito: {
        invoke: {
          src: "getCognitoUserProfile",
          onDone: { target: "authorized", actions: "setUserProfile" },
          onError: { target: "unauthorized", actions: "onError" },
        },
        on: {
          LOGOUT: "logout",
        },
      },
    },
  },
  {
    services: {
      performSignup: async (ctx, event) => {
        const payload = omit("type", event);
        const resp = await httpClient.post(`http://localhost:${backendPort}/users`, payload);
        history.push("/signin");
        return resp.data;
      },
      performLogin: async (ctx, event) => {
        return await httpClient
          .post(`http://localhost:${backendPort}/login`, event)
          .then(({ data }) => {
            history.push("/");
            return data;
          })
          .catch((error) => {
            throw new Error("Username or password is invalid");
          });
      },
      getOktaUserProfile: /* istanbul ignore next */ (ctx, event: any) => {
        // Map Okta User fields to our User Model
        const user = {
          id: event.user.sub,
          email: event.user.email,
          firstName: event.user.given_name,
          lastName: event.user.family_name,
          username: event.user.preferred_username,
        };

        // Set Access Token in Local Storage for API calls
        localStorage.setItem(process.env.REACT_APP_AUTH_TOKEN_NAME!, event.token);

        return Promise.resolve({ user });
      },
      getUserProfile: async (ctx, event) => {
        const resp = await httpClient.get(`http://localhost:${backendPort}/checkAuth`);
        return resp.data;
      },
      getGoogleUserProfile: /* istanbul ignore next */ (ctx, event: any) => {
        // Map Google User fields to our User Model
        const user = {
          id: event.user.googleId,
          email: event.user.email,
          firstName: event.user.givenName,
          lastName: event.user.familyName,
          avatar: event.user.imageUrl,
        };

        // Set Google Access Token in Local Storage for API calls
        localStorage.setItem(process.env.REACT_APP_AUTH_TOKEN_NAME!, event.token);

        return Promise.resolve({ user });
      },
      getAuth0UserProfile: /* istanbul ignore next */ (ctx, event: any) => {
        // Map Auth0 User fields to our User Model
        const user = {
          id: event.user.sub,
          email: event.user.email,
          firstName: event.user.nickname,
          avatar: event.user.picture,
        };

        // Set Auth0 Access Token in Local Storage for API calls
        localStorage.setItem(process.env.REACT_APP_AUTH_TOKEN_NAME!, event.token);

        return Promise.resolve({ user });
      },
      updateProfile: async (ctx, event: any) => {
        const payload = omit("type", event);
        const resp = await httpClient.patch(
          `http://localhost:${backendPort}/users/${payload.id}`,
          payload
        );
        return resp.data;
      },
      performLogout: async (ctx, event) => {
        localStorage.removeItem("authState");
        return await httpClient.post(`http://localhost:${backendPort}/logout`);
      },
      getCognitoUserProfile: /* istanbul ignore next */ (ctx, event: any) => {
        // Map Cognito User fields to our User Model
        const ourUser = {
          id: event.user.sub,
          email: event.user.email,
        };

        // Set Access Token in Local Storage for API calls
        localStorage.setItem(
          process.env.REACT_APP_AUTH_TOKEN_NAME!,
          event.user.signInUserSession.accessToken.jwtToken
        );

        return Promise.resolve(ourUser);
      },
    },
    actions: {
      redirectHomeAfterLogin: async (ctx, event) => {
        if (history.location.pathname === "/signin") {
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

export const authService = interpret(authMachine)
  .onTransition((state) => {
    if (state.changed) {
      localStorage.setItem("authState", JSON.stringify(state));
    }
  })
  .start(resolvedState);
