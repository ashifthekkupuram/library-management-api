import type { Request, Response, NextFunction } from "express";
import { verifyJWT, type JWTPayload } from "../utils/jwt.ts";
import { JWTExpired } from "jose/errors";

export type AuthenticatedRequestType = Request & {
  user?: JWTPayload;
};

export const authenticate = async (
  req: AuthenticatedRequestType,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: "Bad Request",
      });
    }

    const payload = await verifyJWT(token);

    req.user = payload;

    next();
  } catch (e) {
    if (e instanceof JWTExpired) {
      return res.status(401).json({
        error: "Forbidden",
      });
    }
    throw e;
  }
};
