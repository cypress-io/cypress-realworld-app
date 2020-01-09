//require("dotenv").config();

import express, { Request, Response } from "express";
import path from "path";
import _ from "lodash";
import logger from "morgan";
import passport from "passport";
import session from "express-session";
import shortid from "shortid";
import bodyParser from "body-parser";

import db from "./backend/database";
import auth from "./backend/auth";
import { ensureAuthenticated } from "./backend/helpers";

const app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(
  session({ secret: "session secret", resave: false, saveUninitialized: true })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(auth);

app.get("/users", ensureAuthenticated, (req, res) => {
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

app.post("/users", ensureAuthenticated, (req, res) => {
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

app.get(
  "/users/:user_id",
  ensureAuthenticated,
  (req: Request, res: Response) => {
    // TODO: validate post via joi
    const { user_id } = req.params;

    // Permission: account owner
    // @ts-ignore
    if (!_.isEqual(user_id, req.user.id)) {
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
  }
);

app.get("/users/profile/:username", (req, res) => {
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

app.patch("/users/:user_id", ensureAuthenticated, (req, res) => {
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

app.use(express.static(path.join(__dirname, "../public")));

export default app;
