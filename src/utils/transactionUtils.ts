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
  LikeNotification,
  CommentNotification,
} from "../models";
import faker from "faker";
import { dinero, add, subtract, toFormat, toSnapshot, isPositive, Dinero } from "dinero.js";
import { USD } from "@dinero.js/currencies";
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

const currencySymbols = {
  USD: "$",
};

type CurrencySymbolsIndices = keyof typeof currencySymbols;

export const dineroUSD = (amount: number) => dinero({ amount, currency: USD });

export const format = (dineroObject: Dinero<number>, fractionDigits?: number) =>
  toFormat(dineroObject, ({ amount, currency }) => {
    const { scale } = toSnapshot(dineroObject);
    const symbol = currencySymbols[currency.code as CurrencySymbolsIndices] || currency.code;

    return `${symbol}${amount.toFixed(fractionDigits ?? scale)}`;
  });

export const isRequestTransaction = (transaction: Transaction) =>
  flow(get("requestStatus"), negate(isEmpty))(transaction);

/* istanbul ignore next */
export const isPendingRequestTransaction = (transaction: Transaction) =>
  flow(get("requestStatus"), isEqual(TransactionRequestStatus.pending))(transaction);

/* istanbul ignore next */
export const isAcceptedRequestTransaction = (transaction: Transaction) =>
  flow(get("requestStatus"), isEqual(TransactionRequestStatus.accepted))(transaction);

/* istanbul ignore next */
export const isRejectedRequestTransaction = (transaction: Transaction) =>
  flow(get("requestStatus"), isEqual(TransactionRequestStatus.rejected))(transaction);

export const isPayment = negate(isRequestTransaction);

/* istanbul ignore next */
export const getFakeAmount = (min: number = 1000, max: number = 50000) =>
  parseInt(faker.finance.amount(min, max), 10);

/* istanbul ignore next */
export const formatAmount = (amount: number) => format(dineroUSD(amount));

/* istanbul ignore next */
export const formatAmountSlider = (amount: number) => format(dineroUSD(amount), 0);

export const payAppDifference = curry((sender: User, transaction: Transaction) =>
  subtract(dineroUSD(get("balance", sender)), dineroUSD(get("amount", transaction)))
);

export const payAppAddition = curry((sender: User, transaction: Transaction) =>
  add(dineroUSD(get("balance", sender)), dineroUSD(get("amount", transaction)))
);

export const getChargeAmount = (sender: User, transaction: Transaction) => {
  const { amount } = toSnapshot(payAppDifference(sender, transaction));

  return Math.abs(amount);
};

export const getTransferAmount = curry((sender: User, transaction: Transaction) => {
  const { amount } = toSnapshot(payAppDifference(sender, transaction));

  return Math.abs(amount);
});

export const getPayAppCreditedAmount = (receiver: User, transaction: Transaction) => {
  const { amount } = toSnapshot(payAppAddition(receiver, transaction));

  return Math.abs(amount);
};

export const hasSufficientFunds = (sender: User, transaction: Transaction) => {
  return isPositive(payAppDifference(sender, transaction));
};

/* istanbul ignore next */
export const receiverIsCurrentUser = (currentUser: User, transaction: Transaction) =>
  isEqual(get("id", currentUser), get("receiverId", transaction));

export const formatFullName = (user: User) =>
  flow(pick(["firstName", "lastName"]), values, join(" "))(user);

export const isCommentNotification = (
  notification: NotificationType
): notification is CommentNotification => has("commentId")(notification);

export const isLikeNotification = (
  notification: NotificationType
): notification is LikeNotification => has("likeId")(notification);

export const isPaymentNotification = (notification: NotificationType) =>
  has("status")(notification);

/* istanbul ignore next */
export const isPaymentRequestedNotification = (notification: NotificationType) =>
  flow(get("status"), isEqual(PaymentNotificationStatus.requested))(notification);

/* istanbul ignore next */
export const isPaymentReceivedNotification = (notification: NotificationType) =>
  flow(get("status"), isEqual(PaymentNotificationStatus.received))(notification);

/* istanbul ignore next */
export const currentUserLikesTransaction = (
  currentUser: User,
  transaction: TransactionResponseItem
) =>
  flow(
    find((like) => flow(get("userId"), isEqual(get("id", currentUser)))(like)),
    negate(isEmpty)
  )(transaction.likes);

export const hasDateQueryFields = (query: TransactionQueryPayload | TransactionDateRangePayload) =>
  has("dateRangeStart", query) && has("dateRangeEnd", query);

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

/* istanbul ignore next */
export const hasPaginationQueryFields = (
  query: TransactionQueryPayload | TransactionAmountRangePayload
) => has("page", query) && has("limit", query);

export const omitPaginationQueryFields = (query: TransactionQueryPayload) =>
  omit(["page", "limit"], query);

/* istanbul ignore next */
export const getQueryWithoutDateFields = (query: TransactionQueryPayload) =>
  query && hasDateQueryFields(query) ? omitDateQueryFields(query) : query;

/* istanbul ignore next */
export const getQueryWithoutAmountFields = (query: TransactionQueryPayload) =>
  query && hasAmountQueryFields(query) ? omitAmountQueryFields(query) : query;

export const getQueryWithoutFilterFields = (query: TransactionQueryPayload) =>
  flow(omitAmountQueryFields, omitDateQueryFields, omitPaginationQueryFields)(query);

/* istanbul ignore next */
export const padAmountWithZeros = (number: number) => Math.ceil(number * 1000);

/* istanbul ignore next */
export const amountRangeValueText = (value: number) =>
  flow(padAmountWithZeros, formatAmount)(value);

/* istanbul ignore next */
export const amountRangeValueTextLabel = (value: number) =>
  /* istanbul ignore next */
  flow(padAmountWithZeros, formatAmountSlider)(value);

/* istanbul ignore next */
export const formatAmountRangeValues = (amountRangeValues: number[]) =>
  /* istanbul ignore next */
  flow(map(padAmountWithZeros), map(formatAmountSlider), join(" - "))(amountRangeValues);

export const getPaginatedItems = (page: number, limit: number, items: any) => {
  const offset = (page - 1) * limit;
  const pagedItems = drop(offset, items).slice(0, limit);

  return {
    totalPages: Math.ceil(items.length / limit),
    data: pagedItems,
  };
};

// Custom UTC functions per:
// https://github.com/date-fns/date-fns/issues/376#issuecomment-544274031
// not used in application code
/* istanbul ignore next */
export const startOfDayUTC = (date: Date) => new Date(new Date(date).setUTCHours(0, 0, 0, 0));

// not used in application code
/* istanbul ignore next */
export const endOfDayUTC = (date: Date) => new Date(new Date(date).setUTCHours(23, 59, 59, 999));
