import { Transaction, User } from "../models";
import faker from "faker";
import Dinero from "dinero.js";
import { flow, get, isEmpty, negate } from "lodash/fp";

export const isRequestTransaction = (transaction: Transaction) =>
  flow(get("requestStatus"), negate(isEmpty))(transaction);

export const isPayment = negate(isRequestTransaction);

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
