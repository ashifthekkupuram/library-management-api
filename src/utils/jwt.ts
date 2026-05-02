import { SignJWT, jwtVerify } from "jose";
import { createSecretKey } from "crypto";

import { env } from "../../env.ts";

export type JWTPayload = {
  id: string;
  username: string;
  role: "admin" | "librarian";
  createdAt: Date;
};

export const createJWT = (payload: JWTPayload) => {
  const secret = env.JWT_SECRET;
  const secretKey = createSecretKey(secret, "utf-8");

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(env.JWT_EXPIRES_IN)
    .sign(secretKey);
};

export const verifyJWT = async (token: string): Promise<JWTPayload> => {
  const secretKey = createSecretKey(env.JWT_SECRET, "utf-8");
  const { payload } = await jwtVerify(token, secretKey);

  return {
    id: payload.id as string,
    username: payload.username as string,
    role: payload.role as "admin" | "librarian",
    createdAt: payload.createdAt as Date,
  };
};
