//require("dotenv").config();

import express, { Request, Response, NextFunction } from "express";
import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import path from "path";
import jsonServer from "json-server";
import passport from "passport";
import session from "express-session";
import shortid from "shortid";
import bcrypt from "bcrypt";
import flash from "connect-flash";
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

const server = jsonServer.create();
const router = jsonServer.router(databaseFile);

// @ts-ignore
const middlewares = jsonServer.defaults({ watch: false });

server.use(express.json());
server.use(middlewares);

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

server.use(
  session({
    secret: "session secret",
    cookie: {},
    resave: false,
    saveUninitialized: true
  })
);
server.use(passport.initialize());
server.use(passport.session());

server.use(flash());

// authentication routes
server.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
  })
);

server.get("/logout", (req, res) => {
  console.log("log out successfully");
  req.logOut();
  res.redirect("/");
});

server.get("/users", ensureAuthenticated, (req, res) => {
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

server.post("/users", ensureAuthenticated, (req, res) => {
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

server.get(
  "/users/:user_id",
  ensureAuthenticated,
  (req: Request, res: Response) => {
    // create db handle inside each route so data is refreshed between requests
    const db = low(adapter);

    // TODO: validate post via joi
    const { user_id } = req.params;

    console.log("UID: ", user_id);
    console.log("USER: ", req.user);

    // Permission: account owner
    // @ts-ignore
    if (user_id !== req.user.id) {
      res.status(401).send({
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

server.get("/users/profile/:username", (req, res) => {
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

server.patch("/users/:user_id", ensureAuthenticated, (req, res) => {
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

// Uncomment to use json-server routes
//server.use(router);

export default server;
