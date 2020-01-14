///<reference path="types.ts" />

import express from "express";

import {
  getTransactionsForUserByObj,
  getTransactionsForUserContacts
} from "./database";
import { ensureAuthenticated, validateMiddleware } from "./helpers";
import {
  sanitizeTransactionStatus,
  sanitizeRequestStatus,
  isTransactionQSValidator
} from "./validators";
const router = express.Router();

// Routes

//GET /transactions - scoped user, auth-required
router.get(
  "/",
  ensureAuthenticated,
  validateMiddleware([
    sanitizeTransactionStatus,
    sanitizeRequestStatus,
    ...isTransactionQSValidator
  ]),
  (req, res) => {
    const transactions = getTransactionsForUserByObj(req.user?.id!, req.query);

    res.status(200);
    res.json({ transactions });
  }
);

//GET /transactions/contacts - scoped user, auth-required
router.get(
  "/contacts",
  ensureAuthenticated,
  validateMiddleware([
    sanitizeTransactionStatus,
    sanitizeRequestStatus,
    ...isTransactionQSValidator
  ]),
  (req, res) => {
    console.log(req.query);
    const transactions = getTransactionsForUserContacts(
      req.user?.id!,
      req.query
    );

    res.status(200);
    res.json({ transactions });
  }
);

//GET /transactions/public - auth-required

//POST /transactions - scoped-user

//PATCH /transactions/:transaction_id - scoped-user

export default router;
