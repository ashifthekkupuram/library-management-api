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

    const [{ bookItemsCount }] = await db
      .select({ bookItemsCount: count() })
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
      bookItemsCount,
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
