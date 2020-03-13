import { omit } from "lodash/fp";
import { Machine, assign } from "xstate";
import { dataMachine } from "./dataMachine";
import { httpClient } from "../utils/asyncUtils";
import { User } from "../models";

export interface CreateTransactionMachineSchema {
  states: {
    stepOne: {};
    stepTwo: {};
    done: {};
  };
}

const transactionDataMachine = dataMachine("transactionData").withConfig({
  services: {
    createData: async (ctx, event: any) => {
      const payload = omit("type", event);
      const resp = await httpClient.post(
        `http://localhost:3001/transactions`,
        payload
      );
      return resp.data;
    }
  }
});

export type CreateTransactionMachineEvents =
  | { type: "SET_USERS" }
  | { type: "CREATE" }
  | { type: "COMPLETE" };

export interface CreateTransactionMachineContext {
  sender: User;
  receiver: User;
}

export const createTransactionMachine = Machine<
  CreateTransactionMachineContext,
  CreateTransactionMachineSchema,
  CreateTransactionMachineEvents
>(
  {
    id: "createTransaction",
    initial: "stepOne",
    states: {
      stepOne: {
        on: {
          SET_USERS: "stepTwo"
        }
      },
      stepTwo: {
        entry: "setSenderAndReceiver",
        invoke: {
          id: "transactionDataMachine",
          src: transactionDataMachine,
          autoForward: true
        },
        on: {
          CREATE: "done"
        }
      },
      done: {
        type: "final"
      }
    }
  },
  {
    actions: {
      setSenderAndReceiver: assign((ctx, event: any) => ({
        sender: event.sender,
        receiver: event.receiver
      }))
    }
  }
);
