import { Machine, assign } from "xstate";

interface FilterSchema {
  states: {
    dateRange: {
      states: {
        none: {};
        filter: {};
      };
    };
    amountRange: {
      states: {
        none: {};
        filter: {};
      };
    };
  };
}

type DateFilterEvent = {
  type: "DATE_FILTER";
  dateRangeStart: string;
  dateRangeEnd: string;
};
type AmountFilterEvent = {
  type: "AMOUNT_FILTER";
  amountMin: string;
  amountMax: string;
};
type DateResetEvent = { type: "DATE_RESET" };
type AmountResetEvent = { type: "AMOUNT_RESET" };
type FilterEvents =
  | { type: "NONE" }
  | DateFilterEvent
  | AmountFilterEvent
  | DateResetEvent
  | AmountResetEvent;

export interface FilterContext {}

export const transactionFiltersMachine = Machine<FilterContext, FilterSchema, FilterEvents>(
  {
    id: "filters",
    type: "parallel",
    context: {},
    states: {
      dateRange: {
        initial: "none",
        states: {
          none: {
            entry: "resetDateRange",
            on: {
              DATE_FILTER: "filter",
            },
          },
          filter: {
            entry: "setDateRange",
            on: {
              DATE_RESET: "none",
            },
          },
        },
      },
      amountRange: {
        initial: "none",
        states: {
          none: {
            entry: "resetAmountRange",
            on: {
              AMOUNT_FILTER: "filter",
            },
          },
          filter: {
            entry: "setAmountRange",
            on: {
              AMOUNT_RESET: "none",
              AMOUNT_FILTER: "filter",
            },
          },
        },
      },
    },
  },
  {
    actions: {
      setDateRange: assign((ctx: FilterContext, event: any) => ({
        dateRangeStart: event.dateRangeStart,
        dateRangeEnd: event.dateRangeEnd,
      })),
      resetDateRange: assign((ctx: FilterContext, event: any) => ({
        dateRangeStart: undefined,
        dateRangeEnd: undefined,
      })),
      setAmountRange: assign((ctx: FilterContext, event: any) => ({
        amountMin: event.amountMin,
        amountMax: event.amountMax,
      })),
      resetAmountRange: assign((ctx: FilterContext, event: any) => ({
        amountMin: undefined,
        amountMax: undefined,
      })),
    },
  }
);
