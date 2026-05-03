import type { Response } from "express";
import type { AuthenticatedRequestType } from "../middlewares/authenticate.ts";

import { bookMetadatas } from "../db/schema.ts";
import db from "../db/connection.ts";
import { eq, ilike, or, count } from "drizzle-orm";
import { env } from "../../env.ts";
import { fi } from "zod/locales";

export const getBookMetadatas = async (
  req: AuthenticatedRequestType,
  res: Response,
) => {
  try {
    const { page, query } = req.query;

    const search = query || "";
    const pageNumber = Math.max(1, Number(page) || 1);
    const offset = (pageNumber - 1) * env.BOOK_METADATA_PAGE_LIMIT;

    const filters = or(
      ilike(bookMetadatas.name, `%${search}%`),
      ilike(bookMetadatas.author, `%${search}%`),
    );

    const [{ totalBookMetadatas }] = await db
      .select({ totalBookMetadatas: count() })
      .from(bookMetadatas)
      .where(filters);


    const datas = await db
      .select()
      .from(bookMetadatas)
      .where(filters)
      .orderBy(bookMetadatas.createdAt)
      .limit(env.BOOK_METADATA_PAGE_LIMIT)
      .offset(offset);

    return res.json({
      message: "Book Metadatas recieved",
      bookMetadatas: datas,
      totalBookMetadatas,
    });
  } catch (e) {
    throw e;
  }
};

export const getBookMetadata = async (
  req: AuthenticatedRequestType,
  res: Response,
) => {
  try {
    const { id } = req.params;

    const [bookMetadata] = await db
      .select()
      .from(bookMetadatas)
      .where(eq(bookMetadatas.id, id as string));

    if (!bookMetadata) {
      return res.status(404).json({
        error: "Book Metadata not found.",
      });
    }

    return res.json({
      message: "Book Metadata received.",
      bookMetadata,
    });
  } catch (e) {
    throw e;
  }
};

export const createBookMetadata = async (
  req: AuthenticatedRequestType,
  res: Response,
) => {
  try {
    const { name, author, iconUrl, releasedYear } = req.body;

    const [bookMetadata] = await db
      .insert(bookMetadatas)
      .values({
        name,
        author,
        iconUrl,
        releasedYear,
      })
      .returning();

    return res.json({
      message: "Book Metadata created.",
      bookMetadata,
    });
  } catch (e) {
    throw e;
  }
};

export const updateBookMetadata = async (
  req: AuthenticatedRequestType,
  res: Response,
) => {
  try {
    const { name, author, iconUrl, releasedYear } = req.body;
    const { id } = req.params;

    const [updatedBookMetadata] = await db
      .update(bookMetadatas)
      .set({
        name,
        author,
        iconUrl,
        releasedYear,
      })
      .where(eq(bookMetadatas.id, id as string))
      .returning();

    if (!updatedBookMetadata) {
      return res.status(404).json({
        error: "Book Metadata not found.",
      });
    }

    res.json({
      message: "Book Metadata updated.",
      bookMetadata: updatedBookMetadata,
    });
  } catch (e) {
    throw e;
  }
};

export const deleteBookMetadata = async (
  req: AuthenticatedRequestType,
  res: Response,
) => {
  try {
    const { id } = req.params;

    const [deletedBookMetadata] = await db
      .delete(bookMetadatas)
      .where(eq(bookMetadatas.id, id as string))
      .returning();

    if (!deletedBookMetadata) {
      return res.status(404).json({
        error: "Book Metadata not found.",
      });
    }

    return res.json({
      message: "Book Metadata deleted.",
    });
  } catch (e) {
    throw e;
  }
};
