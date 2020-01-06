//require("dotenv").config();

import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import path from "path";
import jsonServer from "json-server";
import passport from "passport";
import session from "express-session";
const LocalStrategy = require("passport-local").Strategy;

let databaseFileName;

if (process.env.NODE_ENV === "test") {
  databaseFileName = "database.test.json";
} else {
  databaseFileName = "database.json";
}

const databaseFile = path.join(__dirname, "data", databaseFileName);

const adapter = new FileSync(databaseFile);
const db = low(adapter);

const server = jsonServer.create();
const router = jsonServer.router(databaseFile);

// @ts-ignore
const middlewares = jsonServer.defaults({ watch: true });

server.use(middlewares);

// configure passport for local strategy
passport.use(
  new LocalStrategy(function(
    username: string,
    password: string,
    done: Function
  ) {
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

server.use(router);
server.listen(3001, () => {
  console.log("JSON Server is running");
});
