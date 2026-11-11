///<reference path="types.ts" />

import express from "express";

import {
  getBankAccountsByUserId,
  getBankAccountById,
  createBankAccountForUser,
  removeBankAccountById,
} from "./database";
import { ensureAuthenticated, validateMiddleware } from "./helpers";
import { shortIdValidation, isBankAccountValidator } from "./validators";
import { maybeChaosFail } from "./demoBreak";
const router = express.Router();

// Routes

//GET /bankAccounts (scoped-user)
router.get("/", ensureAuthenticated, (req, res) => {
  /* istanbul ignore next */
  const accounts = getBankAccountsByUserId(req.user?.id!);

  res.status(200);
  res.json({ results: accounts });
});

//GET /bankAccounts/:bankAccountId (scoped-user)
router.get(
  "/:bankAccountId",
  ensureAuthenticated,
  validateMiddleware([shortIdValidation("bankAccountId")]),
  (req, res) => {
    const { bankAccountId } = req.params;

    const account = getBankAccountById(bankAccountId);

    res.status(200);
    res.json({ account });
  }
);

//POST /bankAccounts (scoped-user)
router.post("/", ensureAuthenticated, validateMiddleware(isBankAccountValidator), (req, res) => {
  // DEMO BREAK: unreliable bank account creation (~30% success)
  if (
    maybeChaosFail(res, {
      successRate: 0.3,
      status: 500,
      error: "BankAccountCreateFailed",
      message: "Simulated failure creating bank account (DEMO_BREAK)",
    })
  ) {
    return;
  }

  /* istanbul ignore next */
  const account = createBankAccountForUser(req.user?.id!, req.body);

  res.status(200);
  res.json({ account });
});

//DELETE (soft) /bankAccounts (scoped-user)
router.delete(
  "/:bankAccountId",
  ensureAuthenticated,
  validateMiddleware([shortIdValidation("bankAccountId")]),
  (req, res) => {
    const { bankAccountId } = req.params;

    const account = removeBankAccountById(bankAccountId);

    res.status(200);
    res.json({ account });
  }
);

export default router;
