///<reference path="types.ts" />

import express from "express";
import { getLikesByTransactionId, createLikes } from "./database";
import { ensureAuthenticated, validateMiddleware } from "./helpers";
import { shortIdValidation } from "./validators";
const router = express.Router();

// Routes

//GET /likes/:transactionId
router.get(
  "/:transactionId",
  ensureAuthenticated,
  validateMiddleware([shortIdValidation("transactionId")]),
  (req, res) => {
    const { transactionId } = req.params;
    const likes = getLikesByTransactionId(transactionId);

    res.status(200);
    res.json({ likes });
  }
);

//POST /likes/:transactionId
router.post(
  "/:transactionId",
  ensureAuthenticated,
  validateMiddleware([shortIdValidation("transactionId")]),
  (req, res) => {
    const { transactionId } = req.params;
    /* istanbul ignore next */
    createLikes(req.user?.id!, transactionId);

    // INTENTIONAL FLAKE
    // create an arbitrary delay on the server side to simulate slow or inconsistent response time
    const delay = Math.random() * 5500;
    setTimeout(() => {
      res.sendStatus(200);
    }, delay);
  }
);

export default router;
