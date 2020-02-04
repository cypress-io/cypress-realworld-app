import { Transaction } from "../models";
import faker from "faker";
import Dinero from "dinero.js";

export function isRequestTransaction(transaction: Transaction) {
  return transaction.requestStatus || false;
}
export const getFakeAmount = () => parseInt(faker.finance.amount(), 10);

export const formatAmount = (amount: number) => Dinero({ amount }).toFormat();
