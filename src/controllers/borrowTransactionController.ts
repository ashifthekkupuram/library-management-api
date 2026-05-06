import type { Response } from "express";
import type { AuthenticatedRequestType } from "../middlewares/authenticate.ts";
import { eq, count, and, or } from "drizzle-orm";

import db from "../db/connection.ts";
import {
  borrowTransactions,
  bookItems,
  type BookItemConditionType,
  type BorrowTransactionStatusType,
} from "../db/schema.ts";
import { env } from "../../env.ts";
import addDaysToDate from "../utils/addDaysToDate.ts";
import { DrizzleQueryError } from "drizzle-orm";
import { DatabaseError } from "pg";

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
      return res.status(404).json({
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
    // if error thrown because of custom unique index on the borrow transaction table in the database
    // unique index: cannot exist more then one rows where same bookItemId and status is "borrowed" at the same time
    if (e instanceof DrizzleQueryError && e.cause instanceof DatabaseError) {
      if (
        e.cause.code === "23505" &&
        e.cause.constraint === "unique_active_borrow"
      ) {
        return res.status(400).json({
          error: "The book is already borrowed. Try Again",
        });
      }
    }
    throw e;
  }
};

export const getBorrowedTransactions = async (
  req: AuthenticatedRequestType,
  res: Response,
) => {
  try {
    const { page, status, customerId, bookItemId } = req.query;

    const pageNumber = Math.max(1, Number(page) || 1);
    const offset = (pageNumber - 1) * env.TRANSACTION_PAGE_LIMIT;

    const filters = or(
      status
        ? eq(borrowTransactions.status, status as BorrowTransactionStatusType)
        : undefined,
      customerId
        ? eq(borrowTransactions.customerId, customerId as string)
        : undefined,
      bookItemId
        ? eq(borrowTransactions.bookItemId, bookItemId as string)
        : undefined,
    );

    const [{ totalBorrowedTransactions }] = await db
      .select({ totalBorrowedTransactions: count() })
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
      message: "Transactions Retrieved.",
      getBorrowedTransactions: datas,
      totalBorrowedTransactions,
    });
  } catch (e) {
    throw e;
  }
};

export const getBorrowedTransaction = async (
  req: AuthenticatedRequestType,
  res: Response,
) => {
  try {
    const { id } = req.params;

    const [transaction] = await db
      .select()
      .from(borrowTransactions)
      .where(eq(borrowTransactions.id, id as string));

    if (!transaction) {
      return res.status(404).json({
        error: "Transaction not found.",
      });
    }

    return res.json({
      message: "Transaction retrieved",
      transaction,
    });
  } catch (e) {
    throw e;
  }
};

export const returnBorrowedBook = async (
  req: AuthenticatedRequestType,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { condition } = req.body;

    const returnCondition = condition as BookItemConditionType;

    const [transaction] = await db
      .select()
      .from(borrowTransactions)
      .where(eq(borrowTransactions.id, id as string));

    if (!transaction) {
      return res.status(404).json({
        error: "Transaction not found.",
      });
    }

    if (transaction.status === "returned") {
      return res.status(400).json({
        error: "Book already Returned.",
      });
    }

    const now = new Date();

    let fineAmount: number = 0;
    let fineReasons: string[] = [];
    let fineReason: string | null = null;

    if (now > transaction.dueDate) {
      const diffDays = Math.ceil(
        (now.getTime() - transaction.dueDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      fineAmount += diffDays * 20;

      fineReasons.push("Late return");
    }

    if (returnCondition !== "good") {
      fineAmount += 300;
      fineReasons.push("Damaged condition");
    }

    fineReasons.length ? (fineReason = fineReasons.join(" and ")) : null;

    await db
      .update(borrowTransactions)
      .set({
        fineAmount: fineAmount.toString(),
        status: "returned",
        returnedAt: now,
        returnedBy: req.user?.id || null,
        fineReason,
      })
      .where(eq(borrowTransactions.id, id as string));

    await db
      .update(bookItems)
      .set({ status: "available", condition: returnCondition })
      .where(eq(bookItems.id, transaction.bookItemId));

    return res.json({
      message: "Book Returned",
      fineAmount,
      fineReason,
    });
  } catch (e) {
    throw e;
  }
};

export const payFineForReturnedBook = async (
  req: AuthenticatedRequestType,
  res: Response,
) => {
  try {
    const { id } = req.params;

    const [transaction] = await db
      .select()
      .from(borrowTransactions)
      .where(eq(borrowTransactions.id, id as string));

    const now = new Date();

    if (!transaction) {
      return res.status(404).json({
        error: "Transaction not found.",
      });
    }

    if (transaction.status === "borrowed") {
      return res.status(400).json({
        error: "Book not returned yet.",
      });
    }

    if (!transaction.fineAmount) {
      return res.status(400).json({
        error: "Don't have fine.",
      });
    }

    if (transaction.finePaidAt !== null) {
      return res.status(400).json({
        error: "Fine already paid.",
      });
    }

    await db
      .update(borrowTransactions)
      .set({ finePaidAt: now })
      .where(eq(borrowTransactions.id, id as string));

    return res.json({
      message: "Fine payment has been made.",
    });
  } catch (e) {}
};
