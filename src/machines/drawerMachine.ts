import { Machine } from "xstate";

export const drawerMachine = Machine({
  id: "drawer",
  type: "parallel",
  states: {
    desktop: {
      initial: "open",
      states: {
        closed: {
          on: { TOGGLE_DESKTOP: "open", OPEN_DESKTOP: "open" },
        },
        open: {
          on: { TOGGLE_DESKTOP: "closed", CLOSE_DESKTOP: "closed" },
        },
      },
    },
    mobile: {
      initial: "closed",
      states: {
        closed: {
          on: { TOGGLE_MOBILE: "open", OPEN_MOBILE: "open" },
        },
        open: {
          on: { TOGGLE_MOBILE: "closed", CLOSE_MOBILE: "closed" },
        },
      },
    },
  },
});
