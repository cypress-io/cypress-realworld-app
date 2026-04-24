import express, { Request, Response } from "express";
import { join } from "path";
import logger from "morgan";
import passport from "passport";
import session from "express-session";
import bodyParser from "body-parser";
import cors from "cors";
import paginate from "express-paginate";
import { createHandler as graphqlHandler } from "graphql-http/lib/use/express";
import { loadSchemaSync } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { addResolversToSchema } from "@graphql-tools/schema";

import auth from "./auth";
import userRoutes from "./user-routes";
import contactRoutes from "./contact-routes";
import bankAccountRoutes from "./bankaccount-routes";
import gqlPlaygroundRoutes from "./gql-playground-routes";
import transactionRoutes from "./transaction-routes";
import likeRoutes from "./like-routes";
import commentRoutes from "./comment-routes";
import notificationRoutes from "./notification-routes";
import bankTransferRoutes from "./banktransfer-routes";
import testDataRoutes from "./testdata-routes";
import { checkAuth0Jwt, verifyOktaToken, checkCognitoJwt, checkGoogleJwt } from "./helpers";
import resolvers from "./graphql/resolvers";
import { frontendPort, getBackendPort } from "../src/utils/portUtils";

// Type definition for coverage data
type CoverageData = {
  [key: string]: {
    path: string;
    s: { [key: string]: number };
    f: { [key: string]: number };
    b: { [key: string]: number[] };
    statementMap?: any;
    fnMap?: any;
    branchMap?: any;
  };
};

require("dotenv").config();

const corsOption = {
  origin: `http://localhost:${frontendPort}`,
  credentials: true,
};

const schema = loadSchemaSync(join(__dirname, "./graphql/schema.graphql"), {
  loaders: [new GraphQLFileLoader()],
});

const schemaWithResolvers = addResolversToSchema({
  schema,
  resolvers,
});

const app = express();

/* istanbul ignore next */
// @ts-expect-error
if (global.__coverage__) {
  // Coverage endpoint - only sends path + statement counts (s) to keep response size manageable
  // The full coverage object with statementMap, fnMap, branchMap, f, b can exceed 100MB
  app.get("/__coverage__", (req: Request, res: Response) => {
    const globalWithCoverage = global as { __coverage__?: CoverageData };
    const coverage = globalWithCoverage.__coverage__ || {};

    // Strip to only what mapCoverage needs: path and statement execution counts (s)
    const lightweight: { [key: string]: { path: string; s: { [key: string]: number } } } = {};
    for (const [key, data] of Object.entries(coverage)) {
      lightweight[key] = { path: data.path, s: data.s };
    }

    res.json(lightweight);
  });

  // Reset coverage counters between tests — zeroes all statement/function/branch counts
  // without removing the instrumentation structure, so new coverage is tracked from scratch
  app.delete("/__coverage__", (req: Request, res: Response) => {
    const globalWithCoverage = global as { __coverage__?: CoverageData };
    const coverage = globalWithCoverage.__coverage__;
    if (coverage) {
      for (const fileData of Object.values(coverage)) {
        for (const key of Object.keys(fileData.s)) fileData.s[key] = 0;
        for (const key of Object.keys(fileData.f)) fileData.f[key] = 0;
        for (const key of Object.keys(fileData.b)) fileData.b[key] = fileData.b[key].map(() => 0);
      }
    }
    res.json({ reset: true });
  });
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

/* istanbul ignore if */
if (process.env.VITE_AUTH0) {
  app.use(checkAuth0Jwt);
}

/* istanbul ignore if */
if (process.env.VITE_OKTA) {
  app.use(verifyOktaToken);
}

/* istanbul ignore if */
if (process.env.VITE_AWS_COGNITO) {
  app.use(checkCognitoJwt);
}

/* istanbul ignore if */
if (process.env.VITE_GOOGLE) {
  app.use(checkGoogleJwt);
}

app.get("/", (req, res) => {
  res.send("Cypress Realworld App - backend");
});
app.use("/graphql", gqlPlaygroundRoutes);
app.use(
  "/graphql",
  graphqlHandler({
    schema: schemaWithResolvers,
    context: async (req, _args) => {
      return { user: req.raw.user };
    },
  })
);
app.use("/users", userRoutes);
app.use("/contacts", contactRoutes);
app.use("/bankAccounts", bankAccountRoutes);
app.use("/transactions", transactionRoutes);
app.use("/likes", likeRoutes);
app.use("/comments", commentRoutes);
app.use("/notifications", notificationRoutes);
app.use("/bankTransfers", bankTransferRoutes);

app.use(express.static(join(__dirname, "../public")));

getBackendPort().then((port) => {
  app.listen(port);
});
