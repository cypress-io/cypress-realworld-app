///<reference path="types.ts" />

import express from "express";
import _ from "lodash";
import shortid, { isValid } from "shortid";
import db from "./database";
import { ensureAuthenticated } from "./helpers";
const router = express.Router();

router.get("/", ensureAuthenticated, (req, res) => {
  console.log("RU", req.user);

  // TODO: validate order query param(s)

  // TODO:
  // Query Params:
  // order
  //   - default: scoped user contacts first, then all other users
  //   - "top_first": contacts with most transactions first

  const users = db.get("users").value();
  res.status(200).json({ users, user: req.user });
});

router.post("/", ensureAuthenticated, (req, res) => {
  // TODO: validate post via joi
  const user = req.body;

  const id = shortid();
  user.id = id;

  db.get("users")
    // @ts-ignore
    .push(user)
    .write();

  const record = db
    .get("users")
    // @ts-ignore
    .find({ id })
    .value();

  res.status(201);
  res.json({ user: record });
});

router.get("/:user_id", ensureAuthenticated, (req, res) => {
  // TODO: validate post via joi
  const { user_id } = req.params;

  if (!isValid(user_id)) {
    return res.status(422);
  }

  // Permission: account owner
  if (!_.isEqual(user_id, req.user?.id)) {
    return res.status(401).send({
      error: "Unauthorized"
    });
  }

  const user = db
    .get("users")
    // @ts-ignore
    .find({ id: user_id })
    .value();

  res.status(200);
  res.json({ user });
});

router.get("/profile/:username", (req, res) => {
  // TODO: validate post via joi
  const { username } = req.params;

  const user = db
    .get("users")
    // @ts-ignore
    .find({ username })
    .pick(["first_name", "last_name", "avatar"])
    .value();

  res.status(200);
  res.json({ user });
});

router.patch("/:user_id", ensureAuthenticated, (req, res) => {
  // TODO: validate post via joi
  const { user_id } = req.params;

  const edits = req.body;

  // make update to record
  db.get("users")
    // @ts-ignore
    .find({ id: user_id })
    .assign(edits)
    .write();

  const updatedRecord = db
    .get("users")
    // @ts-ignore
    .find({ id: user_id })
    .value();

  res.status(204);
  res.json({ user: updatedRecord });
});

export default router;
