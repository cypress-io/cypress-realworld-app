import { body, check, oneOf, query, sanitizeQuery } from "express-validator";
import { isValid } from "shortid";
import {
  TransactionStatus,
  RequestStatus,
  DefaultPrivacyLevel,
  NotificationsType,
  PaymentNotificationStatus
} from "../models";
import _ from "lodash";

const TransactionStatusValues = Object.values(TransactionStatus);
const RequestStatusValues = Object.values(RequestStatus);
const DefaultPrivacyLevelValues = Object.values(DefaultPrivacyLevel);
const NotificationsTypeValues = Object.values(NotificationsType);
const PaymentNotificationStatusValues = Object.values(
  PaymentNotificationStatus
);

// Validators

const isShortId = (value: string) => isValid(value);

export const shortIdValidation = (key: string) => check(key).custom(isShortId);

export const searchValidation = query("q").exists();

export const userFieldsValidator = oneOf([
  check("first_name").exists(),
  check("last_name").exists(),
  check("password").exists(),
  check("balance").exists(),
  check("avatar").exists(),
  check("default_privacy_level").exists()
]);

export const isBankAccountValidator = [
  body("bank_name")
    .isString()
    .trim(),
  body("account_number")
    .isString()
    .trim(),
  body("routing_number")
    .isString()
    .trim()
];

export const isUserValidator = [
  check("first_name")
    .optional({ checkFalsy: true })
    .isString()
    .trim(),
  check("last_name")
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
  check("phone_number")
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
  check("default_privacy_level")
    .optional({ checkFalsy: true })
    .isIn(["public", "private", "contacts"])
];

// default status to "complete" if not provided
export const sanitizeTransactionStatus = sanitizeQuery(
  "status"
).customSanitizer(value => {
  if (_.includes(TransactionStatusValues, value)) {
    return value;
  }
  return TransactionStatus.complete;
});

// default request status to undefined if not provided
export const sanitizeRequestStatus = sanitizeQuery(
  "request_status"
).customSanitizer(value => {
  if (_.includes(RequestStatusValues, value)) {
    return value;
  }
  return;
});

export const isTransactionQSValidator = [
  query("status")
    .optional({ checkFalsy: true })
    .isIn(TransactionStatusValues)
    .trim(),
  query("request_status")
    .optional({ checkFalsy: true })
    .isIn(RequestStatusValues)
    .trim(),
  query("receiver_id")
    .optional({ checkFalsy: true })
    .isString()
    .trim(),
  query("sender_id")
    .optional({ checkFalsy: true })
    .isString()
    .trim(),
  query("range_start_ts")
    .optional({ checkFalsy: true })
    .isString()
    .trim(),
  query("range_end_ts")
    .optional({ checkFalsy: true })
    .isString()
    .trim(),
  query("amount_max")
    .optional({ checkFalsy: true })
    .isNumeric()
    .trim(),
  query("amount_min")
    .optional({ checkFalsy: true })
    .isNumeric()
    .trim()
];

export const isTransactionPayloadValidator = [
  body("type")
    .isIn(["payment", "request"])
    .trim(),
  body("privacy_level")
    .isIn(DefaultPrivacyLevelValues)
    .trim(),
  body("source")
    .isString()
    .trim(),
  body("receiver_id")
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
  body("request_status").isIn(RequestStatusValues)
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
  body("items.*.transaction_id").custom(isShortId)
  // TODO: figure out how to get working
  /*oneOf([
    body("items.*.like_id").custom(isShortId),
    body("items.*.comment_id").custom(isShortId),
    body("items.*.status")
      .isIn(PaymentNotificationStatusValues)
      .trim()
  ])*/
];

export const isNotificationPatchValidator = [body("is_read").isBoolean()];
