import { Transaction } from "../models";
import faker from "faker";

export function isRequestTransaction(transaction: Transaction) {
  return transaction.requestStatus || false;
}
export const getFakeAmount = () => parseInt(faker.finance.amount(), 10);
