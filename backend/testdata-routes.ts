///<reference path="types.ts" />

import express from "express";
import { getAllForEntity, seedDatabase, cleanupDatabase } from "./database";
import { validateMiddleware } from "./helpers";
import { isValidEntityValidator } from "./validators";
import { DbSchema } from "../src/models/db-schema";
const router = express.Router();

// Routes

//POST /testData/seed
router.post("/seed", (req, res) => {
  seedDatabase();
  res.sendStatus(200);
});

//POST /testData/cleanup
router.post("/cleanup", (req, res) => {
  cleanupDatabase();
  res.sendStatus(200);
});

//GET /testData/:entity
router.get("/:entity", validateMiddleware([...isValidEntityValidator]), (req, res) => {
  const { entity } = req.params;
  const results = getAllForEntity(entity as keyof DbSchema);

  res.status(200);
  res.json({ results });
});

export default router;
