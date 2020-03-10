import { Machine, assign } from "xstate";
import { concat } from "lodash/fp";

interface DataSchema {
  states: {
    idle: {};
    loading: {};
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
type DataEvents = { type: "FETCH" } | SuccessEvent | FailureEvent;

export interface DataContext {
  pageData?: object;
  results?: any[];
  message?: string;
}

export const dataMachine = (machineId: string) =>
  Machine<DataContext, DataSchema, DataEvents>(
    {
      id: machineId,
      initial: "idle",
      context: {
        pageData: {},
        results: []
      },
      states: {
        idle: {
          on: { FETCH: "loading" }
        },
        loading: {
          invoke: {
            src: "fetchData",
            onDone: { target: "success" },
            onError: { target: "failure", actions: "setMessage" }
          }
        },
        success: {
          entry: ["setResults", "setPageData"],
          on: {
            FETCH: "loading"
          },
          initial: "unknown",
          states: {
            unknown: {
              on: {
                "": [
                  { target: "withData", cond: "hasData" },
                  { target: "withoutData" }
                ]
              }
            },
            withData: {
              //entry: ["notifyHasData"]
            },
            withoutData: {}
          }
        },
        failure: {
          entry: ["setMessage"],
          on: {
            FETCH: "loading"
          }
        }
      }
    },
    {
      actions: {
        setResults: assign((ctx: DataContext, event: any) => ({
          results:
            event.data && event.data.pageData && event.data.pageData.page > 1
              ? concat(ctx.results, event.data.results)
              : event.data.results
        })),
        setPageData: assign((ctx: DataContext, event: any) => ({
          pageData: event.data.pageData
        })),
        setMessage: assign((ctx, event: any) => ({
          message: event.message
        }))
      },
      guards: {
        hasData: (ctx: DataContext, event) =>
          !!ctx.results && ctx.results.length > 0
      }
    }
  );
