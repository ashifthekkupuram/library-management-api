import type { Response } from "express";
import type { AuthenticatedRequestType } from "../middlewares/authenticate.ts";
import { eq, count, and } from "drizzle-orm";

import db from "../db/connection.ts";
import {
  borrowTransactions,
  bookItems,
  type BorrowTransactionStatusType,
} from "../db/schema.ts";
import { env } from "../../env.ts";
import addDaysToDate from "../utils/addDaysToDate.ts";

export const getBorrowTransactionByCustomer = async (
  req: AuthenticatedRequestType,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { page, status } = req.query;

    const pageNumber = Math.max(1, Number(page) || 1);
    const offset = (pageNumber - 1) * pageNumber;

    const filters = and(
      eq(borrowTransactions.customerId, id as string),
      status
        ? eq(borrowTransactions.status, status as BorrowTransactionStatusType)
        : undefined,
    );

    const [{ totalBorrowTransactions }] = await db
      .select({ totalBorrowTransactions: count() })
      .from(borrowTransactions)
      .where(filters);

    const datas = await db
      .select()
      .from(borrowTransactions)
      .where(filters)
      .orderBy(borrowTransactions.createdAt)
      .limit(env.TRANSACTION_PAGE_LIMIT)
      .offset(offset);

    return res.json({
      message: "Borrow Transactions Recieved.",
      borrowTransactions: datas,
      totalBorrowTransactions,
    });
  } catch (e) {
    throw e;
  }
};

export const createBorrowTransactionByCustomer = async (
  req: AuthenticatedRequestType,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { bookMetadataId } = req.body;

    const [bookItem] = await db
      .select()
      .from(bookItems)
      .where(
        and(
          eq(bookItems.bookMetadataId, bookMetadataId as string),
          eq(bookItems.condition, "good"),
          eq(bookItems.status, "available"),
        ),
      );

    if (!bookItem) {
      return res.status(400).json({
        error: "Book are not available now.",
      });
    }

    const dueDate = addDaysToDate(new Date(), 14);

    const [transaction] = await db
      .insert(borrowTransactions)
      .values({
        bookItemId: bookItem.id,
        customerId: id as string,
        dueDate,
        issuedBy: req.user?.id || null,
      })
      .returning();

    await db
      .update(bookItems)
      .set({ status: "borrowed" })
      .where(eq(bookItems.id, bookItem.id));

    return res.status(201).json({
      message: "Transaction is created",
      transaction,
    });
  } catch (e) {
    throw e;
  }
};
