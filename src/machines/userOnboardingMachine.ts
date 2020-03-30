import { Machine } from "xstate";

export interface UserOnboardingMachineSchema {
  states: {
    idle: {};
    stepOne: {};
    stepTwo: {};
    stepThree: {};
    done: {};
  };
}

export type UserOnboardingMachineEvents = { type: "PREV" } | { type: "NEXT" };

export interface UserOnboardingMachineContext {}

export const userOnboardingMachine = Machine<
  UserOnboardingMachineContext,
  UserOnboardingMachineSchema,
  UserOnboardingMachineEvents
>({
  id: "userOnboarding",
  initial: "stepOne",
  states: {
    idle: {
      on: {
        NEXT: "stepOne",
      },
    },
    stepOne: {
      on: {
        NEXT: "stepTwo",
      },
    },
    stepTwo: {
      on: {
        PREV: "stepOne",
        NEXT: "stepThree",
      },
    },
    stepThree: {
      on: {
        PREV: "stepTwo",
        NEXT: "done",
      },
    },
    done: {
      type: "final",
    },
  },
});
