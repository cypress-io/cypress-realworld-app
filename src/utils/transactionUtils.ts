import {
  Transaction,
  User,
  TransactionRequestStatus,
  NotificationType,
  PaymentNotificationStatus
} from "../models";
import faker from "faker";
import Dinero from "dinero.js";
import {
  flow,
  get,
  isEmpty,
  negate,
  curry,
  isEqual,
  join,
  pick,
  values,
  has
} from "lodash/fp";
import { getUserById } from "../backend/database";

export const isRequestTransaction = (transaction: Transaction) =>
  flow(get("requestStatus"), negate(isEmpty))(transaction);

export const isPendingRequestTransaction = (transaction: Transaction) =>
  flow(
    get("requestStatus"),
    isEqual(TransactionRequestStatus.pending)
  )(transaction);

export const isAcceptedRequestTransaction = (transaction: Transaction) =>
  flow(
    get("requestStatus"),
    isEqual(TransactionRequestStatus.accepted)
  )(transaction);

export const isRejectedRequestTransaction = (transaction: Transaction) =>
  flow(
    get("requestStatus"),
    isEqual(TransactionRequestStatus.rejected)
  )(transaction);

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

export const isNewTransactionPath = (pathname: string) =>
  pathname.match(/transaction\/new/);

export const hasPathTransactionId = (pathname: string) =>
  pathname.match(/transaction\/(?!new)(\w+)/);

export const pathTransactionId = (pathname: string) =>
  flow(hasPathTransactionId, get(1))(pathname);

export const senderIsCurrentUser = (sender: User, transaction: Transaction) =>
  isEqual(get("id", sender), get("senderId", transaction));

export const receiverIsCurrentUser = (
  currentUser: User,
  transaction: Transaction
) => isEqual(get("id", currentUser), get("receiverId", transaction));

export const formatFullName = (user: User) =>
  flow(pick(["firstName", "lastName"]), values, join(" "))(user);

export const getFullNameForUser = (userId: User["id"]) =>
  flow(getUserById, formatFullName)(userId);

export const isCommentNotification = (notification: NotificationType) =>
  has("commentId")(notification);

export const isLikeNotification = (notification: NotificationType) =>
  has("likeId")(notification);

export const isPaymentNotification = (notification: NotificationType) =>
  has("status")(notification);

export const isPaymentRequestedNotification = (
  notification: NotificationType
) =>
  flow(
    get("status"),
    isEqual(PaymentNotificationStatus.requested)
  )(notification);

export const isPaymentReceivedNotification = (notification: NotificationType) =>
  flow(
    get("status"),
    isEqual(PaymentNotificationStatus.received)
  )(notification);

export const isNewBankAccountPath = (pathname: string) =>
  pathname.match(/bankaccounts\/new/);

export const hasPathBankAccountId = (pathname: string) =>
  pathname.match(/bankaccounts\/(?!new)(\w+)/);

export const pathBankAccountId = (pathname: string) =>
  flow(hasPathBankAccountId, get(1))(pathname);
