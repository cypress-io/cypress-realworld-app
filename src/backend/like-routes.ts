///<reference path="types.ts" />

import express from "express";
import _ from "lodash";
import { getLikesByTransactionId, createLike } from "./database";
import { ensureAuthenticated, validateMiddleware } from "./helpers";
import { shortIdValidation } from "./validators";
const router = express.Router();

// Routes

//GET /likes/:transaction_id
router.get(
  "/:transaction_id",
  ensureAuthenticated,
  validateMiddleware([shortIdValidation("transaction_id")]),
  (req, res) => {
    const { transaction_id } = req.params;
    const likes = getLikesByTransactionId(transaction_id);

    res.status(200);
    res.json({ likes });
  }
);

//POST /likes/:transaction_id
router.post(
  "/:transaction_id",
  ensureAuthenticated,
  validateMiddleware([shortIdValidation("transaction_id")]),
  (req, res) => {
    const { transaction_id } = req.params;

    const like = createLike(req.user?.id!, transaction_id);

    res.status(200);
    res.json({ like });
  }
);

export default router;
