import { Machine, assign } from "xstate";
import { concat } from "lodash/fp";

export interface DataSchema {
  states: {
    idle: {};
    loading: {};
    updating: {};
    creating: {};
    deleting: {};
    testSetContext: {};
    success: {
      states: {
        unknown: {};
        withData: {};
        withoutData: {};
      };
    };
    failure: {};
  };
}

type SuccessEvent = { type: "SUCCESS"; results: any[]; pageData: object };
type FailureEvent = { type: "FAILURE"; message: string };
export type DataEvents =
  | { type: "FETCH" }
  | { type: "UPDATE" }
  | { type: "CREATE" }
  | { type: "DELETE" }
  | { type: "TEST_SET_CONTEXT" }
  | SuccessEvent
  | FailureEvent;

export interface DataContext {
  pageData?: object;
  results?: any[];
  message?: string;
}

const initialContext: DataContext = {
  pageData: {},
  results: [],
  message: undefined,
};

export const dataMachine = (machineId: string, context: DataContext = initialContext) =>
  Machine<DataContext, DataSchema, DataEvents>(
    {
      id: machineId,
      initial: "idle",
      context: context,
      states: {
        idle: {
          on: {
            FETCH: "loading",
            CREATE: "creating",
            UPDATE: "updating",
            DELETE: "deleting",
            TEST_SET_CONTEXT: "testSetContext",
          },
        },
        testSetContext: {
          entry: ["testSetContext"],
          after: {
            100: "idle",
          },
        },
        loading: {
          invoke: {
            src: "fetchData",
            onDone: { target: "success" },
            onError: { target: "failure", actions: "setMessage" },
          },
        },
        updating: {
          invoke: {
            src: "updateData",
            onDone: { target: "loading" },
            onError: { target: "failure", actions: "setMessage" },
          },
        },
        creating: {
          invoke: {
            src: "createData",
            onDone: { target: "loading" },
            onError: { target: "failure", actions: "setMessage" },
          },
        },
        deleting: {
          invoke: {
            src: "deleteData",
            onDone: { target: "loading" },
            onError: { target: "failure", actions: "setMessage" },
          },
        },
        success: {
          entry: ["setResults", "setPageData"],
          on: {
            FETCH: "loading",
            CREATE: "creating",
            UPDATE: "updating",
            DELETE: "deleting",
            TEST_SET_CONTEXT: "testSetContext",
          },
          initial: "unknown",
          states: {
            unknown: {
              on: {
                "": [{ target: "withData", cond: "hasData" }, { target: "withoutData" }],
              },
            },
            withData: {},
            withoutData: {},
          },
        },
        failure: {
          entry: ["setMessage"],
          on: {
            FETCH: "loading",
          },
        },
      },
    },
    {
      actions: {
        setResults: assign((ctx: DataContext, event: any) => ({
          results:
            event.data && event.data.pageData && event.data.pageData.page > 1
              ? concat(ctx.results, event.data.results)
              : event.data.results,
        })),
        setPageData: assign((ctx: DataContext, event: any) => ({
          pageData: event.data.pageData,
        })),

        setMessage: /* istanbul ignore next */ assign((ctx, event: any) => ({
          message: event.message,
        })),
        testSetContext: /* istanbul ignore next */ assign((ctx, event: any) => event),
      },
      guards: {
        hasData: (ctx: DataContext, event: any) => !!ctx.results && ctx.results.length > 0,
      },
    }
  );
