import { Machine, assign } from "xstate";

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

interface DataContext {
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
            onDone: { target: "success", actions: "setResults" },
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
        setResults: assign((ctx: DataContext, event: any) => {
          console.log("EVENT:", event);
          return {
            results: [ctx.results, ...event.data.results]
          };
        }),
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

/*
const allData = new Array(25).fill(0).map((_val, i) => i + 1);
const perPage = 10;

const dataMachine = new Machine({
  id: "dataMachine",
  initial: "loading",
  context: {
    data: []
  },
  states: {
    loading: {
      invoke: {
        id: "dataLoader",
        src: (context, _event) => {
          return (callback, _onEvent) => {
            setTimeout(() => {
              const { data } = context;
              const newData = allData.slice(data.length, data.length + perPage);
              const hasMore = newData.length === perPage;

              if (hasMore) {
                callback({ type: "DONE_MORE", newData });
              } else {
                callback({ type: "DONE_COMPLETE", newData });
              }
            }, 1000);
          };
        }
      },
      on: {
        DONE_MORE: {
          target: "more",
          actions: assign({
            data: ({ data }, { newData = [] }) => [...data, ...newData]
          })
        },
        DONE_COMPLETE: {
          target: "complete",
          actions: assign({
            data: ({ data }, { newData = [] }) => [...data, ...newData]
          })
        },
        FAIL: "failure"
      }
    },
    more: {
      on: {
        LOAD: "loading"
      }
    },
    complete: { type: "final" },
    failure: { type: "final" }
  }
});
*/
