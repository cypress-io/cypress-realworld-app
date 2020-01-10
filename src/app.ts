//require("dotenv").config();

import express from "express";
import path from "path";
import logger from "morgan";
import passport from "passport";
import session from "express-session";
import bodyParser from "body-parser";

import auth from "./backend/auth";
import userRoutes from "./backend/user-routes";
import contactRoutes from "./backend/contact-routes";

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
app.use("/users", userRoutes);
app.use("/contacts", contactRoutes);

app.use(express.static(path.join(__dirname, "../public")));

app.listen(3001);
