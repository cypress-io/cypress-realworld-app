///<reference path="types.ts" />

import express from "express";
import _ from "lodash";
import {
  getTransactionsForUserByObj,
  getTransactionsForUserContacts,
  createTransaction,
  updateTransactionById,
  getPublicTransactionsDefaultSort,
  getTransactionByIdForApi
} from "./database";
import { ensureAuthenticated, validateMiddleware } from "./helpers";
import {
  sanitizeTransactionStatus,
  sanitizeRequestStatus,
  isTransactionQSValidator,
  isTransactionPayloadValidator,
  shortIdValidation,
  isTransactionPatchValidator,
  isTransactionPublicQSValidator
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
router.get(
  "/public",
  ensureAuthenticated,
  validateMiddleware(isTransactionPublicQSValidator),
  (req, res) => {
    // TODO: expand order outside of "default"
    // const { order } = req.query;
    const transactions = getPublicTransactionsDefaultSort(req.user?.id!);

    res.status(200);
    res.json({ transactions });
  }
);

//POST /transactions - scoped-user
router.post(
  "/",
  ensureAuthenticated,
  validateMiddleware(isTransactionPayloadValidator),
  (req, res) => {
    const transactionPayload = req.body;
    const transactionType = transactionPayload.type;

    _.remove(transactionPayload, "type");

    const transaction = createTransaction(
      req.user?.id!,
      transactionType,
      transactionPayload
    );

    res.status(200);
    res.json({ transaction });
  }
);

//GET /transactions/:transactionId - scoped-user
router.get(
  "/:transactionId",
  ensureAuthenticated,
  validateMiddleware([shortIdValidation("transactionId")]),
  (req, res) => {
    const { transactionId } = req.params;

    const transaction = getTransactionByIdForApi(transactionId);

    res.status(200);
    res.json({ transaction });
  }
);

//PATCH /transactions/:transactionId - scoped-user
router.patch(
  "/:transactionId",
  ensureAuthenticated,
  validateMiddleware([
    shortIdValidation("transactionId"),
    ...isTransactionPatchValidator
  ]),
  (req, res) => {
    const { transactionId } = req.params;

    updateTransactionById(req.user?.id!, transactionId, req.body);

    res.sendStatus(204);
  }
);

export default router;
