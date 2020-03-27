import { Machine } from "xstate";

export const drawerMachine = Machine({
  id: "drawer",
  initial: "open",
  states: {
    closed: {
      on: { TOGGLE: "open", OPEN: "open" }
    },
    open: {
      on: { TOGGLE: "closed", CLOSE: "closed" }
    }
  }
});
