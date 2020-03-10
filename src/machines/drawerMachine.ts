import { Machine } from "xstate";

export const drawerMachine = Machine({
  id: "drawer",
  initial: "closed",
  states: {
    closed: {
      on: { TOGGLE: "open" }
    },
    open: {
      on: { TOGGLE: "closed" }
    }
  }
});
