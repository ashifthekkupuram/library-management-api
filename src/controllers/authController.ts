import type { Request, Response } from "express";

import db from "../db/connection.ts";
import { users } from "../db/schema.ts";
import { hashPassword } from "../utils/password.ts";
import { createJWT } from "../utils/jwt.ts";

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const hashedPassword = await hashPassword(password);

    const [user] = await db
      .insert(users)
      .values({
        username: username,
        password: hashedPassword,
      })
      .returning({
        id: users.id,
        username: users.username,
        role: users.role,
        createdAt: users.createdAt,
      });

    const token = await createJWT({
      id: user.id,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
    });

    res.status(201).json({
      message: "User has been created",
      user,
      token,
    });
  } catch (e) {
    console.error("Error on Register: ", e);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};
