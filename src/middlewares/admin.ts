import type { Response, NextFunction } from "express";
import type { AuthenticatedRequestType } from "./authenticate.ts";

export const admin = (
  req: AuthenticatedRequestType,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(401).json({
        error: "Forbidden",
      });
    }
    next();
  } catch (e) {
    throw e;
  }
};
