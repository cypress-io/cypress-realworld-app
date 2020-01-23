///<reference path="types.ts" />

import express from "express";
import validator from "validator";
import _ from "lodash";
import { parsePhoneNumberFromString } from "libphonenumber-js";

import { getAllUsers, createUser, getUserBy, updateUserById } from "./database";
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

  const users = getAllUsers();
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
      users = getUserBy("email", q);
      return res.status(200).json({ users });
    }

    const phoneNumber = parsePhoneNumberFromString(q);
    if (phoneNumber) {
      users = getUserBy("phone_number", phoneNumber.number);
      return res.status(200).json({ users });
    }

    users = getUserBy("username", q);

    res.status(200).json({ users });
  }
);

router.post(
  "/",
  userFieldsValidator,
  validateMiddleware(isUserValidator),
  (req, res) => {
    const userDetails: User = req.body;

    const user = createUser(userDetails);

    res.status(201);
    res.json({ user: user });
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

    const user = getUserBy("id", user_id);

    res.status(200);
    res.json({ user });
  }
);

router.get("/profile/:username", (req, res) => {
  const { username } = req.params;

  const user = _.pick(getUserBy("username", username), [
    "first_name",
    "last_name",
    "avatar"
  ]);

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

    updateUserById(user_id, edits);

    res.sendStatus(204);
  }
);

export default router;
