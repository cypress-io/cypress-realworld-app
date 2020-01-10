///<reference path="types.ts" />

import express from "express";

import { getBankAccountsByUserId } from "./database";
import { ensureAuthenticated } from "./helpers";
const router = express.Router();

// Routes

//GET /bank_accounts (scoped-user)
router.get("/", ensureAuthenticated, (req, res) => {
  const accounts = getBankAccountsByUserId(req.user?.id!);

  res.status(200);
  res.json({ accounts });
});

//GET /bank_accounts/:bank_account_id (scoped-user)
//POST /bank_accounts (scoped-user)
//DELETE (soft) /bank_accounts (scoped-user)

export default router;
