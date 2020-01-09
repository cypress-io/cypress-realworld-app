//require("dotenv").config();

import express, { Request, Response, NextFunction } from "express";
import _ from "lodash";
import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import path from "path";
import logger from "morgan";
import passport from "passport";
import session from "express-session";
import shortid from "shortid";
import bcrypt from "bcrypt";
import bodyParser from "body-parser";
import { User } from "./models/user";
const LocalStrategy = require("passport-local").Strategy;

let databaseFileName;

if (process.env.NODE_ENV === "test") {
  databaseFileName = "database.test.json";
} else {
  databaseFileName = "database.json";
}

const databaseFile = path.join(__dirname, "data", databaseFileName);
const adapter = new FileSync(databaseFile);

const app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// configure passport for local strategy
passport.use(
  new LocalStrategy(function(
    username: string,
    password: string,
    done: Function
  ) {
    // create db handle inside each route so data is refreshed between requests
    const db = low(adapter);
    const user = db
      .get("users")
      // @ts-ignore
      .find({ username: username })
      .value();

    const failureMessage = "Incorrect username or password.";
    if (!user) {
      return done(null, false, { message: failureMessage });
    }

    // validate password
    if (!bcrypt.compareSync(password, user.password)) {
      return done(null, false, { message: failureMessage });
    }

    return done(null, user);
  })
);

passport.serializeUser(function(user: User, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  // create db handle inside each route so data is refreshed between requests
  const db = low(adapter);
  const user = db
    .get("users")
    // @ts-ignore
    .find({ id })
    // TODO: Limit fields returned in deserialized user object?
    //.pick(["id", "first_name", "last_name"])
    .value();

  done(null, user);
});

const ensureAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).send({
    error: "Unauthorized"
  });
};

app.use(
  session({ secret: "session secret", resave: false, saveUninitialized: true })
);
app.use(passport.initialize());
app.use(passport.session());

// authentication routes
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/"
  }),
  (req: Request, res: Response): void => {
    res.sendStatus(200);
  }
);

app.post("/logout", (req: Request, res: Response): void => {
  req.logout();
  res.sendStatus(200);
});

app.get("/users", ensureAuthenticated, (req, res) => {
  console.log("RU", req.user);
  // create db handle inside each route so data is refreshed between requests
  const db = low(adapter);

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
  // create db handle inside each route so data is refreshed between requests
  const db = low(adapter);
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
    // create db handle inside each route so data is refreshed between requests
    const db = low(adapter);

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
  // create db handle inside each route so data is refreshed between requests
  const db = low(adapter);

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
  // create db handle inside each route so data is refreshed between requests
  const db = low(adapter);

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
