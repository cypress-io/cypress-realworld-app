//require("dotenv").config();

import express from "express";
import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import path from "path";
import jsonServer from "json-server";
import passport from "passport";
import session from "express-session";
import shortid from "shortid";
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
    db.get("users")
      // @ts-ignore
      .find({ username: username })
      .value()
      .then(function(err: Error, user: object) {
        if (err) {
          return done(err);
        }
        const failureMessage = "Incorrect username or password.";
        if (!user) {
          return done(null, false, { message: failureMessage });
        }
        // validate password
        //if (!user.validPassword(password)) {
        //  return done(null, false, { message: failureMessage });
        //}
        return done(null, user);
      });
  })
);

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

server.get("/users", (req, res) => {
  // TODO: validate order query param(s)

  // TODO:
  // Query Params:
  // order
  //   - default: scoped user contacts first, then all other users
  //   - "top_first": contacts with most transactions first

  // create db handle inside each route so data is refreshed between requests
  const db = low(adapter);
  const users = db.get("users").value();
  res.status(200).json({ users });
});

server.post("/users", (req, res) => {
  // TODO: validate post via joi
  const user = req.body;

  const id = shortid();
  user.id = id;

  // create db handle inside each route so data is refreshed between requests
  const db = low(adapter);
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

// Uncomment to use json-server routes
//server.use(router);

export default server;
