import { Transaction, User } from "../models";
import faker from "faker";
import Dinero from "dinero.js";

export function isRequestTransaction(transaction: Transaction) {
  return transaction.requestStatus ? true : false;
}

export function isPayment(transaction: Transaction) {
  return !isRequestTransaction(transaction);
}

export const getFakeAmount = () => parseInt(faker.finance.amount(), 10);

export const formatAmount = (amount: number) => Dinero({ amount }).toFormat();

export const payAppDifference = (
  balance: User["balance"],
  amount: Transaction["amount"]
) => Dinero({ amount: balance }).subtract(Dinero({ amount }));

export const getTransferAmount = (
  balance: User["balance"],
  transactionAmount: Transaction["amount"]
) => Math.abs(payAppDifference(balance, transactionAmount).getAmount());

export const hasInsufficientFunds = (
  balance: User["balance"],
  transactionAmount: Transaction["amount"]
) => payAppDifference(balance, transactionAmount).isNegative();

export const hasSufficientFunds = (
  balance: User["balance"],
  transactionAmount: Transaction["amount"]
) => payAppDifference(balance, transactionAmount).isPositive();
