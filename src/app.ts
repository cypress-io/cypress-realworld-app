//require("dotenv").config();

import express from "express";
import path from "path";
import logger from "morgan";
import passport from "passport";
import session from "express-session";
import bodyParser from "body-parser";
import cors from "cors";
import paginate from "express-paginate";

import auth from "./backend/auth";
import userRoutes from "./backend/user-routes";
import contactRoutes from "./backend/contact-routes";
import bankAccountRoutes from "./backend/bankaccount-routes";
import transactionRoutes from "./backend/transaction-routes";
import likeRoutes from "./backend/like-routes";
import commentRoutes from "./backend/comment-routes";
import notificationRoutes from "./backend/notification-routes";
import bankTransferRoutes from "./backend/banktransfer-routes";
import testDataRoutes from "./backend/testdata-routes";

const corsOption = {
  origin: "http://localhost:3000",
  credentials: true
};

const app = express();

app.use(cors(corsOption));
app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(
  session({ secret: "session secret", resave: false, saveUninitialized: true })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(paginate.middleware(10, 50));

app.use(auth);
app.use("/users", userRoutes);
app.use("/contacts", contactRoutes);
app.use("/bankAccounts", bankAccountRoutes);
app.use("/transactions", transactionRoutes);
app.use("/likes", likeRoutes);
app.use("/comments", commentRoutes);
app.use("/notifications", notificationRoutes);
app.use("/bankTransfers", bankTransferRoutes);
app.use("/testData", testDataRoutes);

app.use(express.static(path.join(__dirname, "../public")));

app.listen(3001);
