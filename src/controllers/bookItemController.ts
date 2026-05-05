import type { Response } from "express";
import type { AuthenticatedRequestType } from "../middlewares/authenticate.ts";
import { eq, count, or, ilike, and } from "drizzle-orm";

import db from "../db/connection.ts";
import {
  bookItems,
  type BookItemStatusType,
  type BookItemConditionType,
} from "../db/schema.ts";
import { env } from "../../env.ts";

export const getBookItemsByMetadata = async (
  req: AuthenticatedRequestType,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { page, condition, status } = req.query;

    const pageNumber = Math.max(1, Number(page) || 1);
    const offset = (pageNumber - 1) * env.BOOK_ITEM_PAGE_LIMIT;

    const filters = and(
      eq(bookItems.bookMetadataId, id as string),
      condition
        ? eq(bookItems.condition, condition as BookItemConditionType)
        : undefined,
      status ? eq(bookItems.status, status as BookItemStatusType) : undefined,
    );

    const [{ totalBookItems }] = await db
      .select({ totalBookItems: count() })
      .from(bookItems)
      .where(filters);

    const datas = await db
      .select()
      .from(bookItems)
      .where(filters)
      .orderBy(bookItems.createdAt)
      .limit(env.BOOK_ITEM_PAGE_LIMIT)
      .offset(offset);

    return res.json({
      message: "Book Items Recieved",
      bookItems: datas,
      totalBookItems,
    });
  } catch (e) {
    throw e;
  }
};

export const createBookItemByMetadata = async (
  req: AuthenticatedRequestType,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { quantity, condition } = req.body;

    const items = Array.from({ length: quantity }, () => ({
      bookMetadataId: id as string,
      condition: condition as BookItemConditionType,
      status: "available" as BookItemStatusType,
    }));

    const datas = await db.insert(bookItems).values(items).returning();

    return res.json({
      message: "Book Items Created",
      bookItems: datas,
    });
  } catch (e) {
    throw e;
  }
};

export const getBookItems = async (
  req: AuthenticatedRequestType,
  res: Response,
) => {
  try {
    const { page, condition, status } = req.query;

    const pageNumber = Math.max(1, Number(page) || 1);
    const offset = (pageNumber - 1) * env.BOOK_ITEM_PAGE_LIMIT;

    const filters = and(
      condition
        ? eq(bookItems.condition, condition as BookItemConditionType)
        : undefined,
      status ? eq(bookItems.status, status as BookItemStatusType) : undefined,
    );

    const [{ totalBookItems }] = await db
      .select({ totalBookItems: count() })
      .from(bookItems)
      .where(filters);

    const datas = await db
      .select()
      .from(bookItems)
      .where(filters)
      .orderBy(bookItems.createdAt)
      .limit(env.BOOK_ITEM_PAGE_LIMIT)
      .offset(offset);

    return res.json({
      message: "Book Items created",
      bookItems: datas,
      totalBookItems,
    });
  } catch (e) {
    throw e;
  }
};

export const getBookItem = async (
  req: AuthenticatedRequestType,
  res: Response,
) => {
  try {
    const { id } = req.params;

    const [data] = await db
      .select()
      .from(bookItems)
      .where(eq(bookItems.id, id as string));

    if (!data) {
      return res.status(404).json({
        error: "Book Item not found.",
      });
    }

    res.json({
      message: "Book Item Recieved.",
      bookItem: data,
    });
  } catch (e) {
    throw e;
  }
};

export const updateBookItem = async (
  req: AuthenticatedRequestType,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { condition, status } = req.body;

    const [data] = await db
      .update(bookItems)
      .set({
        condition: condition as BookItemConditionType,
        status: status as BookItemStatusType,
      })
      .where(eq(bookItems.id, id as string))
      .returning();

    if (!data) {
      return res.status(404).json({
        error: "Book Item not found.",
      });
    }

    return res.json({
      message: "Book Item Deleted.",
      bookItem: data,
    });
  } catch (e) {
    throw e;
  }
};

export const deleteBookItem = async (
  req: AuthenticatedRequestType,
  res: Response,
) => {
  try {
    const { id } = req.params;

    const [data] = await db
      .delete(bookItems)
      .where(eq(bookItems.id, id as string))
      .returning();

    if (!data) {
      return res.status(404).json({
        error: "Book Item not found.",
      });
    }

    return res.json({
      message: "Book Item Deleted.",
    });
  } catch (e) {
    throw e;
  }
};
