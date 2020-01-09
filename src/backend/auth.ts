import passport from "passport";
import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import db from "./database";
import { User } from "../models/user";
const LocalStrategy = require("passport-local").Strategy;
const router = express.Router();

// configure passport for local strategy
passport.use(
  new LocalStrategy(function(
    username: string,
    password: string,
    done: Function
  ) {
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
  const user = db
    .get("users")
    // @ts-ignore
    .find({ id })
    // TODO: Limit fields returned in deserialized user object?
    //.pick(["id", "first_name", "last_name"])
    .value();

  done(null, user);
});

// authentication routes
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/"
  }),
  (req: Request, res: Response): void => {
    res.sendStatus(200);
  }
);

router.post("/logout", (req: Request, res: Response): void => {
  req.logout();
  res.sendStatus(200);
});

export default router;
