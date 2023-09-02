import dotenv from "dotenv";
import { set } from "lodash";
import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import jwt from "express-jwt";
import jwksRsa from "jwks-rsa";

// @ts-ignore
import OktaJwtVerifier from "@okta/jwt-verifier";
// @ts-ignore
import awsConfig from "../src/aws-exports";

dotenv.config();

const auth0JwtConfig = {
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.VITE_AUTH0_DOMAIN}/.well-known/jwks.json`,
  }),

  // Validate the audience and the issuer.
  audience: process.env.VITE_AUTH0_AUDIENCE,
  issuer: `https://${process.env.VITE_AUTH0_DOMAIN}/`,
  algorithms: ["RS256"],
};

// Okta Validate the JWT Signature
const oktaJwtVerifier = new OktaJwtVerifier({
  issuer: `https://${process.env.VITE_OKTA_DOMAIN}/oauth2/default`,
  clientId: process.env.VITE_OKTA_CLIENTID,
  assertClaims: {
    aud: "api://default",
    cid: process.env.VITE_OKTA_CLIENTID,
  },
});
const googleJwtConfig = {
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: "https://www.googleapis.com/oauth2/v3/certs",
  }),

  // Validate the audience and the issuer.
  audience: process.env.VITE_GOOGLE_CLIENTID,
  issuer: "accounts.google.com",
  algorithms: ["RS256"],
};

/* istanbul ignore next */
export const verifyOktaToken = (req: Request, res: Response, next: NextFunction) => {
  const bearerHeader = req.headers["authorization"];

  if (bearerHeader) {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];

    oktaJwtVerifier
      .verifyAccessToken(bearerToken, "api://default")
      .then((jwt: any) => {
        // the token is valid
        req.user = {
          // @ts-ignore
          sub: jwt.sub,
        };
        return next();
      })
      .catch((err: any) => {
        // a validation failed, inspect the error
        console.log("error", err);
      });
  } else {
    res.status(401).send({
      error: "Unauthorized",
    });
  }
};

// Amazon Cognito Validate the JWT Signature
// https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html#amazon-cognito-user-pools-using-tokens-step-2
const awsCognitoJwtConfig = {
  secret: jwksRsa.expressJwtSecret({
    jwksUri: `https://cognito-idp.${awsConfig.aws_cognito_region}.amazonaws.com/${awsConfig.aws_user_pools_id}/.well-known/jwks.json`,
  }),

  issuer: `https://cognito-idp.${awsConfig.aws_cognito_region}.amazonaws.com/${awsConfig.aws_user_pools_id}`,
  algorithms: ["RS256"],
};

export const checkAuth0Jwt = jwt(auth0JwtConfig).unless({ path: ["/testData/*"] });
export const checkCognitoJwt = jwt(awsCognitoJwtConfig).unless({ path: ["/testData/*"] });
export const checkGoogleJwt = jwt(googleJwtConfig).unless({ path: ["/testData/*"] });

export const ensureAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    // @ts-ignore
    // Map sub to id on req.user
    if (req.user?.sub) {
      /* istanbul ignore next */
      // @ts-ignore
      set(req.user, "id", req.user.sub);
    }
    return next();
  }
  /* istanbul ignore next */
  res.status(401).send({
    error: "Unauthorized",
  });
};

export const validateMiddleware = (validations: any[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation: any) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(422).json({ errors: errors.array() });
  };
};
