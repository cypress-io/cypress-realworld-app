import { body, check, oneOf, query, sanitizeQuery } from "express-validator";
import { isValid } from "shortid";
import {
  TransactionStatus,
  RequestStatus,
  DefaultPrivacyLevel,
  NotificationsType
  //PaymentNotificationStatus
} from "../models";
import { includes } from "lodash/fp";

const TransactionStatusValues = Object.values(TransactionStatus);
const RequestStatusValues = Object.values(RequestStatus);
const DefaultPrivacyLevelValues = Object.values(DefaultPrivacyLevel);
const NotificationsTypeValues = Object.values(NotificationsType);
/*const PaymentNotificationStatusValues = Object.values(
  PaymentNotificationStatus
);*/

// Validators

const isShortId = (value: string) => isValid(value);

export const shortIdValidation = (key: string) => check(key).custom(isShortId);

export const searchValidation = query("q").exists();

export const userFieldsValidator = oneOf([
  check("firstName").exists(),
  check("lastName").exists(),
  check("password").exists(),
  check("balance").exists(),
  check("avatar").exists(),
  check("defaultPrivacyLevel").exists()
]);

export const isBankAccountValidator = [
  body("bankName")
    .isString()
    .trim(),
  body("accountNumber")
    .isString()
    .trim(),
  body("routingNumber")
    .isString()
    .trim()
];

export const isUserValidator = [
  check("firstName")
    .optional({ checkFalsy: true })
    .isString()
    .trim(),
  check("lastName")
    .optional({ checkFalsy: true })
    .isString()
    .trim(),
  check("username")
    .optional({ checkFalsy: true })
    .isString()
    .trim(),
  check("password")
    .optional({ checkFalsy: true })
    .isString()
    .trim(),
  check("email")
    .optional({ checkFalsy: true })
    .isString()
    .trim(),
  check("phoneNumber")
    .optional({ checkFalsy: true })
    .isString()
    .trim(),
  check("balance")
    .optional({ checkFalsy: true })
    .isNumeric()
    .trim(),
  check("avatar")
    .optional({ checkFalsy: true })
    .isURL()
    .trim(),
  check("defaultPrivacyLevel")
    .optional({ checkFalsy: true })
    .isIn(["public", "private", "contacts"])
];

export const sanitizeTransactionStatus = sanitizeQuery(
  "status"
).customSanitizer(value => {
  if (includes(value, TransactionStatusValues)) {
    return value;
  }
  return;
});

// default request status to undefined if not provided
export const sanitizeRequestStatus = sanitizeQuery(
  "requestStatus"
).customSanitizer(value => {
  if (includes(value, RequestStatusValues)) {
    return value;
  }
  return;
});

export const isTransactionQSValidator = [
  query("status")
    .isIn(TransactionStatusValues)
    .optional()
    .trim(),
  query("requestStatus")
    .optional({ checkFalsy: true })
    .isIn(RequestStatusValues)
    .trim(),
  query("receiverId")
    .optional({ checkFalsy: true })
    .isString()
    .trim(),
  query("senderId")
    .optional({ checkFalsy: true })
    .isString()
    .trim(),
  query("rangeStartTs")
    .optional({ checkFalsy: true })
    .isString()
    .trim(),
  query("rangeEndTs")
    .optional({ checkFalsy: true })
    .isString()
    .trim(),
  query("amountMax")
    .optional({ checkFalsy: true })
    .isNumeric()
    .trim(),
  query("amountMin")
    .optional({ checkFalsy: true })
    .isNumeric()
    .trim()
];

export const isTransactionPayloadValidator = [
  body("type")
    .isIn(["payment", "request"])
    .trim(),
  body("privacyLevel")
    .optional()
    .isIn(DefaultPrivacyLevelValues)
    .trim(),
  body("source")
    .optional()
    .isString()
    .trim(),
  body("receiverId")
    .isString()
    .trim(),
  body("description")
    .isString()
    .trim(),
  body("amount")
    .isNumeric()
    .trim()
];

export const isTransactionPatchValidator = [
  body("requestStatus").isIn(RequestStatusValues)
];

export const isTransactionPublicQSValidator = [
  query("order")
    .optional({ checkFalsy: true })
    .isIn(["default"])
];

export const isCommentValidator = body("content")
  .isString()
  .trim();

export const isNotificationsBodyValidator = [
  body("items.*.type")
    .isIn(NotificationsTypeValues)
    .trim(),
  body("items.*.transactionId").custom(isShortId)
  // TODO: figure out how to get working
  /*oneOf([
    body("items.*.likeId").custom(isShortId),
    body("items.*.commentId").custom(isShortId),
    body("items.*.status")
      .isIn(PaymentNotificationStatusValues)
      .trim()
  ])*/
];

export const isNotificationPatchValidator = [body("isRead").isBoolean()];
