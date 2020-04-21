import {
  Transaction,
  User,
  TransactionRequestStatus,
  NotificationType,
  PaymentNotificationStatus,
  TransactionResponseItem,
  TransactionQueryPayload,
  TransactionDateRangePayload,
  TransactionAmountRangePayload,
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
  has,
  find,
  omit,
  map,
  drop,
} from "lodash/fp";

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

export const formatAmountSlider = (amount: number) =>
  Dinero({ amount }).toFormat("$0,0");

export const payAppDifference = curry(
  (sender: User, transaction: Transaction) =>
    Dinero({ amount: get("balance", sender) }).subtract(
      Dinero({ amount: get("amount", transaction) })
    )
);

export const payAppAddition = curry((sender: User, transaction: Transaction) =>
  Dinero({ amount: get("balance", sender) }).add(
    Dinero({ amount: get("amount", transaction) })
  )
);

export const getChargeAmount = (sender: User, transaction: Transaction) =>
  Math.abs(payAppDifference(sender, transaction).getAmount());

export const getTransferAmount = (sender: User, transaction: Transaction) =>
  Math.abs(payAppDifference(sender, transaction).getAmount());

export const getPayAppCreditedAmount = (
  receiver: User,
  transaction: Transaction
) => Math.abs(payAppAddition(receiver, transaction).getAmount());

export const hasInsufficientFunds = (sender: User, transaction: Transaction) =>
  payAppDifference(sender, transaction).isNegative();

export const hasSufficientFunds = (sender: User, transaction: Transaction) =>
  payAppDifference(sender, transaction).isPositive();

export const isNewTransactionPath = (pathname: string) =>
  pathname.match(/transaction\/new/);

export const hasPathTransactionId = (pathname: string) =>
  pathname.match(/transaction\/(?!new)([a-zA-Z0-9._-]+)/);

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
  pathname.match(/bankaccounts\/(?!new)([a-zA-Z0-9._-]+)/);

export const pathBankAccountId = (pathname: string) =>
  flow(hasPathBankAccountId, get(1))(pathname);

export const currentUserLikesTransaction = (
  currentUser: User,
  transaction: TransactionResponseItem
) =>
  flow(
    find((like) => flow(get("userId"), isEqual(get("id", currentUser)))(like)),
    negate(isEmpty)
  )(transaction.likes);

export const hasDateQueryFields = (
  query: TransactionQueryPayload | TransactionDateRangePayload
) => has("dateRangeStart", query) && has("dateRangeEnd", query);

export const getDateQueryFields = (query: TransactionDateRangePayload) =>
  pick(["dateRangeStart", "dateRangeEnd"], query);

export const omitDateQueryFields = (query: TransactionQueryPayload) =>
  omit(["dateRangeStart", "dateRangeEnd"], query);

export const hasAmountQueryFields = (
  query: TransactionQueryPayload | TransactionAmountRangePayload
) => has("amountMin", query) && has("amountMax", query);

export const getAmountQueryFields = (query: TransactionAmountRangePayload) =>
  pick(["amountMin", "amountMax"], query);

export const omitAmountQueryFields = (query: TransactionQueryPayload) =>
  omit(["amountMin", "amountMax"], query);

export const hasPaginationQueryFields = (
  query: TransactionQueryPayload | TransactionAmountRangePayload
) => has("page", query) && has("limit", query);

export const omitPaginationQueryFields = (query: TransactionQueryPayload) =>
  omit(["page", "limit"], query);

export const getQueryWithoutDateFields = (query: TransactionQueryPayload) =>
  query && hasDateQueryFields(query) ? omitDateQueryFields(query) : query;

export const getQueryWithoutAmountFields = (query: TransactionQueryPayload) =>
  query && hasAmountQueryFields(query) ? omitAmountQueryFields(query) : query;

export const getQueryWithoutPaginationFields = (
  query: TransactionQueryPayload
) =>
  query && hasPaginationQueryFields(query)
    ? omitPaginationQueryFields(query)
    : query;

export const getQueryWithoutFilterFields = (query: TransactionQueryPayload) =>
  flow(
    omitAmountQueryFields,
    omitDateQueryFields,
    omitPaginationQueryFields
  )(query);

export const padAmountWithZeros = (number: number) => Math.ceil(number * 1000);

export const amountRangeValueText = (value: number) =>
  flow(padAmountWithZeros, formatAmount)(value);

export const amountRangeValueTextLabel = (value: number) =>
  flow(padAmountWithZeros, formatAmountSlider)(value);

export const formatAmountRangeValues = (amountRangeValues: number[]) =>
  flow(
    map(padAmountWithZeros),
    map(formatAmountSlider),
    join(" - ")
  )(amountRangeValues);

export const getPaginatedItems = (page: number, limit: number, items: any) => {
  const offset = (page - 1) * limit;
  const pagedItems = drop(offset, items).slice(0, limit);

  return {
    totalPages: Math.ceil(items.length / limit),
    data: pagedItems,
  };
};
