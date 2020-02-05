import { Transaction, User } from "../models";
import faker from "faker";
import Dinero from "dinero.js";
import { flow, get, isEmpty, negate, curry } from "lodash/fp";

export const isRequestTransaction = (transaction: Transaction) =>
  flow(get("requestStatus"), negate(isEmpty))(transaction);

export const isPayment = negate(isRequestTransaction);

export const getFakeAmount = () => parseInt(faker.finance.amount(), 10);

export const formatAmount = (amount: number) => Dinero({ amount }).toFormat();

export const payAppDifference = curry(
  (sender: User, transaction: Transaction) =>
    Dinero({ amount: get("balance", sender) }).subtract(
      Dinero({ amount: get("amount", transaction) })
    )
);

export const getChargeAmount = (sender: User, transaction: Transaction) =>
  Math.abs(payAppDifference(sender, transaction).getAmount());

export const getTransferAmount = (sender: User, transaction: Transaction) =>
  Math.abs(payAppDifference(sender, transaction).getAmount());

export const hasInsufficientFunds = (sender: User, transaction: Transaction) =>
  payAppDifference(sender, transaction).isNegative();

export const hasSufficientFunds = (sender: User, transaction: Transaction) =>
  payAppDifference(sender, transaction).isPositive();
