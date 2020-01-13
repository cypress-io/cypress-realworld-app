///<reference path="types.ts" />

import express from "express";

import {
  getBankAccountsByUserId,
  getBankAccountById,
  createBankAccountForUser,
  removeBankAccountById
} from "./database";
import { ensureAuthenticated, validateMiddleware } from "./helpers";
import { shortIdValidation, isBankAccountValidator } from "./validators";
const router = express.Router();

// Routes

//GET /bank_accounts (scoped-user)
router.get("/", ensureAuthenticated, (req, res) => {
  const accounts = getBankAccountsByUserId(req.user?.id!);

  res.status(200);
  res.json({ accounts });
});

//GET /bank_accounts/:bank_account_id (scoped-user)
router.get(
  "/:bank_account_id",
  ensureAuthenticated,
  validateMiddleware([shortIdValidation("bank_account_id")]),
  (req, res) => {
    const { bank_account_id } = req.params;

    const account = getBankAccountById(bank_account_id);

    res.status(200);
    res.json({ account });
  }
);

//POST /bank_accounts (scoped-user)
router.post(
  "/",
  ensureAuthenticated,
  validateMiddleware(isBankAccountValidator),
  (req, res) => {
    const account = createBankAccountForUser(req.user?.id!, req.body);

    res.status(200);
    res.json({ account });
  }
);

//DELETE (soft) /bank_accounts (scoped-user)
router.delete(
  "/:bank_account_id",
  ensureAuthenticated,
  validateMiddleware([shortIdValidation("bank_account_id")]),
  (req, res) => {
    const { bank_account_id } = req.params;

    const account = removeBankAccountById(bank_account_id);

    res.status(200);
    res.json({ account });
  }
);

export default router;
