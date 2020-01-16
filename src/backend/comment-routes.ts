///<reference path="types.ts" />

import express from "express";
import _ from "lodash";
import { getCommentsByTransactionId, createComment } from "./database";
import { ensureAuthenticated, validateMiddleware } from "./helpers";
import { shortIdValidation, isCommentValidator } from "./validators";
const router = express.Router();

// Routes

//GET /comments/:transaction_id
router.get(
  "/:transaction_id",
  ensureAuthenticated,
  validateMiddleware([shortIdValidation("transaction_id")]),
  (req, res) => {
    const { transaction_id } = req.params;
    const comments = getCommentsByTransactionId(transaction_id);

    res.status(200);
    res.json({ comments });
  }
);

//POST /comments/:transaction_id
router.post(
  "/:transaction_id",
  ensureAuthenticated,
  validateMiddleware([shortIdValidation("transaction_id"), isCommentValidator]),
  (req, res) => {
    const { transaction_id } = req.params;
    const { content } = req.body;

    const comment = createComment(req.user?.id!, transaction_id, content);

    res.status(200);
    res.json({ comment });
  }
);

export default router;
