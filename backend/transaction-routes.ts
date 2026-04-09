///<reference path="types.ts" />

import express from "express";
import { remove, isEmpty, slice, concat } from "lodash/fp";
import {
  getTransactionsForUserContacts,
  createTransaction,
  updateTransactionById,
  getPublicTransactionsDefaultSort,
  getTransactionByIdForApi,
  getTransactionsForUserForApi,
  getPublicTransactionsByQuery,
} from "./database";
import { ensureAuthenticated, validateMiddleware } from "./helpers";
import {
  sanitizeTransactionStatus,
  sanitizeRequestStatus,
  isTransactionQSValidator,
  isTransactionPayloadValidator,
  shortIdValidation,
  isTransactionPatchValidator,
  isTransactionPublicQSValidator,
} from "./validators";
import { getPaginatedItems } from "../src/utils/transactionUtils";
const router = express.Router();

// Routes

//GET /transactions - scoped user, auth-required
router.get(
  "/",
  ensureAuthenticated,
  validateMiddleware([
    sanitizeTransactionStatus,
    sanitizeRequestStatus,
    ...isTransactionQSValidator,
  ]),
  (req, res) => {
    /* istanbul ignore next */
    const transactions = getTransactionsForUserForApi(req.user?.id!, req.query);

    const { totalPages, data: paginatedItems } = getPaginatedItems(
      req.query.page as unknown as number,
      req.query.limit as unknown as number,
      transactions
    );

    res.status(200);
    res.json({
      pageData: {
        page: res.locals.paginate.page,
        limit: res.locals.paginate.limit,
        hasNextPages: res.locals.paginate.hasNextPages(totalPages),
        totalPages,
      },
      results: paginatedItems,
    });
  }
);

//GET /transactions/contacts - scoped user, auth-required
router.get(
  "/contacts",
  ensureAuthenticated,
  validateMiddleware([
    sanitizeTransactionStatus,
    sanitizeRequestStatus,
    ...isTransactionQSValidator,
  ]),
  (req, res) => {
    /* istanbul ignore next */
    const transactions = getTransactionsForUserContacts(req.user?.id!, req.query);

    const { totalPages, data: paginatedItems } = getPaginatedItems(
      req.query.page as unknown as number,
      req.query.limit as unknown as number,
      transactions
    );

    res.status(200);
    res.json({
      pageData: {
        page: res.locals.paginate.page,
        limit: res.locals.paginate.limit,
        hasNextPages: res.locals.paginate.hasNextPages(totalPages),
        totalPages,
      },
      results: paginatedItems,
    });
  }
);

//GET /transactions/public - auth-required
router.get(
  "/public",
  ensureAuthenticated,
  validateMiddleware(isTransactionPublicQSValidator),
  (req, res) => {
    const isFirstPage = (req.query.page as unknown as number) === 1;

    /* istanbul ignore next */
    let transactions = !isEmpty(req.query)
      ? getPublicTransactionsByQuery(req.user?.id!, req.query)
      : /* istanbul ignore next */
        getPublicTransactionsDefaultSort(req.user?.id!);

    const { contactsTransactions, publicTransactions } = transactions;

    let publicTransactionsWithContacts;

    if (isFirstPage) {
      const firstFiveContacts = slice(0, 5, contactsTransactions);

      publicTransactionsWithContacts = concat(firstFiveContacts, publicTransactions);
    }

    const { totalPages, data: paginatedItems } = getPaginatedItems(
      req.query.page as unknown as number,
      req.query.limit as unknown as number,
      isFirstPage ? publicTransactionsWithContacts : publicTransactions
    );

    res.status(200);
    res.json({
      pageData: {
        page: res.locals.paginate.page,
        limit: res.locals.paginate.limit,
        hasNextPages: res.locals.paginate.hasNextPages(totalPages),
        totalPages,
      },
      results: paginatedItems,
    });
  }
);

//POST /transactions - scoped-user
router.post(
  "/",
  ensureAuthenticated,
  validateMiddleware(isTransactionPayloadValidator),
  (req, res) => {
    const transactionPayload = req.body;
    const transactionType = transactionPayload.transactionType;

    remove("transactionType", transactionPayload);

    /* istanbul ignore next */
    const transaction = createTransaction(req.user?.id!, transactionType, transactionPayload);

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
  validateMiddleware([shortIdValidation("transactionId"), ...isTransactionPatchValidator]),
  (req, res) => {
    const { transactionId } = req.params;

    /* istanbul ignore next */
    updateTransactionById(transactionId, req.body);

    res.sendStatus(204);
  }
);

export default router;
