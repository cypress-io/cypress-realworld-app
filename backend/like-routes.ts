///<reference path="types.ts" />

import express from "express";
import { getLikesByTransactionId, createLikes } from "./database";
import { ensureAuthenticated, validateMiddleware } from "./helpers";
import { shortIdValidation } from "./validators";
import { maybeChaosDelay, maybeChaosFail } from "./demoBreak";
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
  async (req, res) => {
    // DEMO BREAK: likes sometimes hang or hard-fail (timeouts + failed requests)
    await maybeChaosDelay(12000, 0.4);
    if (
      maybeChaosFail(res, {
        successRate: 0.4,
        status: 500,
        error: "LikeFailed",
        message: "Simulated failure liking transaction (DEMO_BREAK)",
      })
    ) {
      return;
    }

    const { transactionId } = req.params;
    /* istanbul ignore next */
    createLikes(req.user?.id!, transactionId);

    res.sendStatus(200);
  }
);

export default router;
