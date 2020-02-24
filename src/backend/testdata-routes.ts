///<reference path="types.ts" />

import express from "express";
import { getAllForEntity } from "./database";
import { ensureAuthenticated, validateMiddleware } from "./helpers";
import { isValidEntityValidator } from "./validators";
const router = express.Router();

// Routes

//GET /testData/:entity
router.get(
  "/:entity",
  ensureAuthenticated,
  validateMiddleware([...isValidEntityValidator]),
  (req, res) => {
    const { entity } = req.params;
    const results = getAllForEntity(entity);

    res.status(200);
    res.json({ results });
  }
);

export default router;
