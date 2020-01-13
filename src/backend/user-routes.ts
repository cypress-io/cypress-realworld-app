///<reference path="types.ts" />

import express from "express";
import validator from "validator";
import _ from "lodash";
import shortid from "shortid";
import { parsePhoneNumberFromString } from "libphonenumber-js";

import db from "./database";
import { User } from "../models/user";
import { ensureAuthenticated, validateMiddleware } from "./helpers";
import {
  shortIdValidation,
  searchValidation,
  userFieldsValidator,
  isUserValidator
} from "./validators";
const router = express.Router();

// Routes
router.get("/", ensureAuthenticated, (req, res) => {
  // TODO: validate order query param(s)

  // TODO:
  // Query Params:
  // order
  //   - default: scoped user contacts first, then all other users
  //   - "top_first": contacts with most transactions first

  const users = db()
    .get("users")
    .value();
  res.status(200).json({ users });
});

router.get(
  "/search",
  ensureAuthenticated,
  validateMiddleware([searchValidation]),
  (req, res) => {
    const { q } = req.query;

    let users;

    // Reference:
    // lowdb full-text search in json-server
    // https://github.com/typicode/json-server/blob/dfea2b34007e731770ca2f4e576b1f1908952b68/src/server/router/plural.js#L86

    if (validator.isEmail(q)) {
      users = db()
        .get("users")
        // @ts-ignore
        .find({ email: q })
        .value();
      return res.status(200).json({ users });
    }

    const phoneNumber = parsePhoneNumberFromString(q);
    if (phoneNumber) {
      users = db()
        .get("users")
        // @ts-ignore
        .find({ phone_number: phoneNumber.number })
        .value();
      return res.status(200).json({ users });
    }

    users = db()
      .get("users")
      // @ts-ignore
      .find({ username: q })
      .value();

    res.status(200).json({ users });
  }
);

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
  validateMiddleware([shortIdValidation("user_id")]),
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
  validateMiddleware([shortIdValidation("user_id"), ...isUserValidator]),
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
