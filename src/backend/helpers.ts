import { Request, Response, NextFunction } from "express";

export const ensureAuthenticated = (
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
