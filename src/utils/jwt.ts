import { SignJWT } from "jose";
import { createSecretKey } from "crypto";

import { env } from "../../env.ts";

type JWTPayload = {
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
