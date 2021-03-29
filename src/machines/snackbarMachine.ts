import { Machine, assign } from "xstate";

export interface SnackbarSchema {
  states: {
    invisible: {};
    visible: {};
  };
}

export type SnackbarEvents = { type: "SHOW" } | { type: "HIDE" };

export interface SnackbarContext {
  severity?: "success" | "info" | "warning" | "error";
  message?: string;
}

export const snackbarMachine = Machine<SnackbarContext, SnackbarSchema, SnackbarEvents>(
  {
    id: "snackbar",
    initial: "invisible",
    context: {
      severity: undefined,
      message: undefined,
    },
    states: {
      invisible: {
        entry: "resetSnackbar",
        on: { SHOW: "visible" },
      },
      visible: {
        entry: "setSnackbar",
        on: { HIDE: "invisible" },
        after: {
          // after 3 seconds, transition to invisible
          3000: "invisible",
        },
      },
    },
  },
  {
    actions: {
      setSnackbar: assign((ctx, event: any) => ({
        severity: event.severity,
        message: event.message,
      })),
      resetSnackbar: assign((ctx, event: any) => ({
        severity: undefined,
        message: undefined,
      })),
    },
  }
);
