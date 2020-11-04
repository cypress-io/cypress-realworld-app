import express from "express";
import path from "path";
import logger from "morgan";
import passport from "passport";
import session from "express-session";
import bodyParser from "body-parser";
import cors from "cors";
import paginate from "express-paginate";

import auth from "./auth";
import userRoutes from "./user-routes";
import contactRoutes from "./contact-routes";
import bankAccountRoutes from "./bankaccount-routes";
import transactionRoutes from "./transaction-routes";
import likeRoutes from "./like-routes";
import commentRoutes from "./comment-routes";
import notificationRoutes from "./notification-routes";
import bankTransferRoutes from "./banktransfer-routes";
import testDataRoutes from "./testdata-routes";
import { checkJwt } from "./helpers";

require("dotenv").config();

const corsOption = {
  origin: "http://localhost:3000",
  credentials: true,
};

const app = express();

/* istanbul ignore next */
// @ts-ignore
if (global.__coverage__) {
  require("@cypress/code-coverage/middleware/express")(app);
}

app.use(cors(corsOption));
app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(
  session({
    secret: "session secret",
    resave: false,
    saveUninitialized: false,
    unset: "destroy",
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(paginate.middleware(+process.env.PAGINATION_PAGE_SIZE!));

/* istanbul ignore next */
if (process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development") {
  app.use("/testData", testDataRoutes);
}

app.use(auth);

/* istanbul ignore next */
if (process.env.REACT_APP_AWS_COGNITO) {
  app.use(checkJwt);
}

app.use("/users", userRoutes);
app.use("/contacts", contactRoutes);
app.use("/bankAccounts", bankAccountRoutes);
app.use("/transactions", transactionRoutes);
app.use("/likes", likeRoutes);
app.use("/comments", commentRoutes);
app.use("/notifications", notificationRoutes);
app.use("/bankTransfers", bankTransferRoutes);

app.use(express.static(path.join(__dirname, "../public")));

app.listen(3001);
