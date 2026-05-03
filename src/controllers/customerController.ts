import type { Response } from "express";
import { count, eq, ilike, or } from "drizzle-orm";
import { DatabaseError } from "pg";
import { DrizzleQueryError } from "drizzle-orm";
import type { AuthenticatedRequestType } from "../middlewares/authenticate.ts";

import { customers } from "../db/schema.ts";
import db from "../db/connection.ts";
import addMonthToDate from "../utils/addMonthToDate.ts";
import generateMembershipID from "../utils/generateMembershipID.ts";
import { env } from "../../env.ts";

export const getCustomers = async (
  req: AuthenticatedRequestType,
  res: Response,
) => {
  try {
    const { page, query } = req.query;

    const search = query || "";
    const pageNumber = Math.max(1, Number(page) || 1);
    const offset = (pageNumber - 1) * env.CUSTOMERS_PAGE_LIMIT;

    const filters = or(
      ilike(customers.name, `%${search}%`),
      ilike(customers.email, `%${search}%`),
      ilike(customers.phone, `%${search}%`),
      ilike(customers.membershipId, `%${search}%`),
    );

    const [{ totalCustomers }] = await db
      .select({ totalCustomers: count() })
      .from(customers)
      .where(filters);

    const datas = await db
      .select()
      .from(customers)
      .where(filters)
      .orderBy(customers.createdAt)
      .limit(env.CUSTOMERS_PAGE_LIMIT)
      .offset(offset);

    return res.json({
      message: "Customers Recieved",
      customers: datas,
      totalCustomers,
    });
  } catch (e) {
    throw e;
  }
};

export const getCustomer = async (
  req: AuthenticatedRequestType,
  res: Response,
) => {
  try {
    const { id } = req.params;

    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, id as string));

    if (!customer) {
      return res.status(404).json({
        error: "Customer not found.",
      });
    }

    return res.json({
      message: "Customer Recieved",
      customer,
    });
  } catch (e) {
    throw e;
  }
};

export const createCustomer = async (
  req: AuthenticatedRequestType,
  res: Response,
) => {
  try {
    const { phone, email, name, membershipDurationMonth } = req.body;

    const membershipExpiresAt = addMonthToDate(
      new Date(),
      membershipDurationMonth,
    );
    const membershipId = generateMembershipID();

    const [customer] = await db
      .insert(customers)
      .values({
        phone,
        email,
        name,
        expiresAt: membershipExpiresAt,
        membershipId,
      })
      .returning();

    return res.json({
      message: "Customer Created",
      customer,
    });
  } catch (e) {
    if (e instanceof DrizzleQueryError && e.cause instanceof DatabaseError) {
      // if error thrown because of email is not unique
      if (
        e.cause.code === "23505" &&
        e.cause.constraint === "customers_email_unique"
      ) {
        return res.status(400).json({
          error: "Customer with email already exist.",
        });
      }

      // if error thrown because of phone number is not unique
      if (
        e.cause.code === "23505" &&
        e.cause.constraint === "customers_phone_unique"
      ) {
        return res.status(400).json({
          error: "Customer with Phone number already exist.",
        });
      }

      if (e.cause.code === "23505") {
        return res.status(400).json({
          error: "Try Again",
        });
      }
    }

    throw e;
  }
};

export const updateCustomer = async (
  req: AuthenticatedRequestType,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { phone, email, name } = req.body;

    const [customer] = await db
      .update(customers)
      .set({ phone, email, name })
      .where(eq(customers.id, id as string))
      .returning();

    if (!customer) {
      return res.status(404).json({
        error: "Customer not found",
      });
    }

    return res.json({
      message: "Customer Updated",
      customer,
    });
  } catch (e) {
    if (e instanceof DrizzleQueryError && e.cause instanceof DatabaseError) {
      // if error thrown because of email is not unique
      if (
        e.cause.code === "23505" &&
        e.cause.constraint === "customers_email_unique"
      ) {
        return res.status(400).json({
          error: "There is another user with the same email.",
        });
      }

      // if error thrown because of phone number is not unique
      if (
        e.cause.code === "23505" &&
        e.cause.constraint === "customers_phone_unique"
      ) {
        return res.status(400).json({
          error: "There is another user with the same phone number.",
        });
      }
    }
    throw e;
  }
};

export const deleteCustomer = async (
  req: AuthenticatedRequestType,
  res: Response,
) => {
  try {
    const { id } = req.params;

    const [deletedCustomer] = await db
      .delete(customers)
      .where(eq(customers.id, id as string))
      .returning();

    if (!deletedCustomer) {
      return res.status(404).json({
        error: "Customer not found",
      });
    }

    return res.json({
      message: "Customer Deleted",
    });
  } catch (e) {
    throw e;
  }
};

export const extendMembership = async (
  req: AuthenticatedRequestType,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { membershipDurationMonth } = req.body;

    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, id as string));

    if (!customer) {
      return res.status(404).json({
        error: "Customer not found",
      });
    }

    const now = new Date();
    const expiresAt = new Date(customer.expiresAt);

    const baseDate = expiresAt < now ? now : expiresAt;

    const newMembershipExpiresAt = addMonthToDate(
      baseDate,
      membershipDurationMonth,
    );

    await db
      .update(customers)
      .set({ expiresAt: newMembershipExpiresAt })
      .where(eq(customers.id, id as string));

    return res.json({
      message: `Customer Membership extended by ${membershipDurationMonth} months`,
    });
  } catch (e) {
    throw e;
  }
};
