///<reference path="types.ts" />

import express from "express";
import validator from "validator";
import _ from "lodash";
import { parsePhoneNumberFromString } from "libphonenumber-js";

import {
  getAllUsers,
  createUser,
  getUserBy,
  updateUserById,
  getUserById
} from "./database";
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
  //   - "topFirst": contacts with most transactions first

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
      users = getUserBy("phoneNumber", phoneNumber.number);
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
  "/:userId",
  ensureAuthenticated,
  validateMiddleware([shortIdValidation("userId")]),
  (req, res) => {
    const { userId } = req.params;

    // Permission: account owner
    if (!_.isEqual(userId, req.user?.id)) {
      return res.status(401).send({
        error: "Unauthorized"
      });
    }

    const user = getUserById(userId);

    res.status(200);
    res.json({ user });
  }
);

router.get("/profile/:username", (req, res) => {
  const { username } = req.params;

  const user = _.pick(getUserBy("username", username), [
    "firstName",
    "lastName",
    "avatar"
  ]);

  res.status(200);
  res.json({ user });
});

router.patch(
  "/:userId",
  ensureAuthenticated,
  userFieldsValidator,
  validateMiddleware([shortIdValidation("userId"), ...isUserValidator]),
  (req, res) => {
    const { userId } = req.params;

    const edits: User = req.body;

    updateUserById(userId, edits);

    res.sendStatus(204);
  }
);

export default router;
