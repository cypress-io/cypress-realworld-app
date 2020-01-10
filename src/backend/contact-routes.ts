///<reference path="types.ts" />

import express from "express";
//import validator from "validator";
//import { check, param, oneOf, query } from "express-validator";
//import _ from "lodash";
//import shortid, { isValid } from "shortid";

import { getContactsByUsername } from "./database";
//import { ensureAuthenticated, validateMiddleware } from "./helpers";
const router = express.Router();

// Validators
//const shortIdValidation = param("user_id").custom(value => {
//  return isValid(value);
//});

// Routes
//GET /contacts/:username
router.get("/:username", (req, res) => {
  const { username } = req.params;

  const contacts = getContactsByUsername(username);

  res.status(200);
  res.json({ contacts });
});

//POST /contacts (scoped-user)
//DELETE /contacts/:contact_id (scoped-user)

export default router;
