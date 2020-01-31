import { Transaction } from "../models";

export function isRequestTransaction(transaction: Transaction) {
  return transaction.requestStatus || false;
}
