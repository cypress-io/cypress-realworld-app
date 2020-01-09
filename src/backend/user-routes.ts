///<reference path="types.ts" />

import express from "express";
import { check, param, oneOf } from "express-validator";
import _ from "lodash";
import shortid, { isValid } from "shortid";
import db from "./database";
import { User } from "../models/user";
import { ensureAuthenticated, validateMiddleware } from "./helpers";
const router = express.Router();

// Validators
const shortIdValidation = param("user_id").custom(value => {
  return isValid(value);
});

const userFieldsValidator = oneOf([
  check("first_name").exists(),
  check("last_name").exists(),
  check("password").exists(),
  check("balance").exists(),
  check("avatar").exists(),
  check("default_privacy_level").exists()
]);

const isUserValidator = [
  check("first_name")
    .optional({ checkFalsy: true })
    .isString()
    .trim(),
  check("last_name")
    .optional({ checkFalsy: true })
    .isString()
    .trim(),
  check("password")
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

// Routes
router.get("/", ensureAuthenticated, (req, res) => {
  console.log("RU", req.user);

  // TODO: validate order query param(s)

  // TODO:
  // Query Params:
  // order
  //   - default: scoped user contacts first, then all other users
  //   - "top_first": contacts with most transactions first

  const users = db()
    .get("users")
    .value();
  res.status(200).json({ users, user: req.user });
});

router.post(
  "/",
  userFieldsValidator,
  validateMiddleware(isUserValidator),
  (req, res) => {
    // TODO: validate post via joi
    const user: User = req.body;

    const id = shortid();
    user.id = id;

    db()
      .get("users")
      // @ts-ignore
      .push(user)
      .write();

    const record = db()
      .get("users")
      // @ts-ignore
      .find({ id })
      .value();

    res.status(201);
    res.json({ user: record });
  }
);

router.get(
  "/:user_id",
  ensureAuthenticated,
  validateMiddleware([shortIdValidation]),
  (req, res) => {
    const { user_id } = req.params;

    // Permission: account owner
    if (!_.isEqual(user_id, req.user?.id)) {
      return res.status(401).send({
        error: "Unauthorized"
      });
    }

    const user = db()
      .get("users")
      // @ts-ignore
      .find({ id: user_id })
      .value();

    res.status(200);
    res.json({ user });
  }
);

router.get("/profile/:username", (req, res) => {
  const { username } = req.params;

  const user = db()
    .get("users")
    // @ts-ignore
    .find({ username })
    .pick(["first_name", "last_name", "avatar"])
    .value();

  res.status(200);
  res.json({ user });
});

router.patch(
  "/:user_id",
  ensureAuthenticated,
  userFieldsValidator,
  validateMiddleware([shortIdValidation, ...isUserValidator]),
  (req, res) => {
    const { user_id } = req.params;

    const edits: User = req.body;

    // make update to record
    db()
      .get("users")
      // @ts-ignore
      .find({ id: user_id })
      .assign(edits)
      .write();

    const updatedRecord = db()
      .get("users")
      // @ts-ignore
      .find({ id: user_id })
      .value();

    res.status(204);
    res.json({ user: updatedRecord });
  }
);

export default router;
