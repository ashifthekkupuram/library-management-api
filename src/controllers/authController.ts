import type { Request, Response } from "express";

import db from "../db/connection.ts";
import { users } from "../db/schema.ts";
import { hashPassword, comparePassword } from "../utils/password.ts";
import { createJWT } from "../utils/jwt.ts";
import { eq } from "drizzle-orm";

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

    return res.status(201).json({
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

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        password: users.password,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.username, username));

    if (!user) {
      return res.status(400).json({
        error: "Invalid credentials.",
      });
    }

    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      return res.status(400).json({
        error: "Invalid credentials.",
      });
    }

    const token = await createJWT({
      id: user.id,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
    });

    return res.json({
      message: "User logged in",
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (e) {
    console.error("Error on Login: ", e);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};
