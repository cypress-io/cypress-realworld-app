import passport from "passport";
import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { getUserBy, getUserById } from "./database";
import { User } from "../models/user";
const LocalStrategy = require("passport-local").Strategy;
const router = express.Router();

// configure passport for local strategy
passport.use(
  new LocalStrategy(function (
    username: string,
    password: string,
    done: Function
  ) {
    const user = getUserBy("username", username);

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

passport.serializeUser(function (user: User, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id: string, done) {
  const user = getUserById(id);
  // TODO: Limit fields returned in deserialized user object?
  //.pick(["id", "firstName", "lastName"])

  done(null, user);
});

// authentication routes
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/",
  }),
  (req: Request, res: Response): void => {
    if (req.body.remember) {
      req.session!.cookie.maxAge = 24 * 60 * 60 * 1000 * 30; // Expire in 30 days
    } else {
      req.session!.cookie.expires = false;
    }
    res.redirect(200, "/");
  }
);

router.post("/logout", (req: Request, res: Response): void => {
  res.clearCookie("connect.sid");
  req.logout();
  req.session!.destroy(function (err) {
    if (err) console.log(err);
    res.redirect("/");
  });
});

router.get("/checkAuth", (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: "User is unauthorised" });
  } else {
    res.status(200).json({ user: req.user });
  }
});

export default router;
