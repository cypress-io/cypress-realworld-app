import { check, param, oneOf, query } from "express-validator";
import { isValid } from "shortid";

// Validators
export const shortIdValidation = (key: string) =>
  param(key).custom(value => {
    return isValid(value);
  });

export const searchValidation = query("q").exists();

export const userFieldsValidator = oneOf([
  check("first_name").exists(),
  check("last_name").exists(),
  check("password").exists(),
  check("balance").exists(),
  check("avatar").exists(),
  check("default_privacy_level").exists()
]);

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
