import {
  pgTable,
  uuid,
  varchar,
  pgEnum,
  timestamp,
  boolean,
  integer,
  decimal,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const userRole = pgEnum("user_role", ["admin", "librarian"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 50 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  role: userRole().default("librarian").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  phone: varchar("phone", { length: 12 }).unique().notNull(),
  email: varchar("email", { length: 255 }).unique(),
  name: varchar("name", { length: 100 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  membershipId: varchar("membership_id", { length: 255 }).unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const bookMetadatas = pgTable(
  "book_metadatas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    author: varchar("author", { length: 100 }).notNull(),
    releasedYear: integer("released_year").notNull(),
    iconUrl: varchar("icon_url", { length: 556 }).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("book_metadata_name_idx").on(table.name),
    index("book_metadata_author_idx").on(table.author),
  ],
);

export const bookItemStatus = pgEnum("book_item_status", [
  "available",
  "borrowed",
  "reserved",
]);
export const bookItemCondition = pgEnum("book_item_condition", [
  "good",
  "damaged",
  "lost",
]);

export const bookItems = pgTable(
  "book_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookMetadataId: uuid("book_metadata_id")
      .references(() => bookMetadatas.id, {
        onDelete: "cascade",
      })
      .notNull(),
    status: bookItemStatus().default("available").notNull(),
    condition: bookItemCondition().default("good").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("book_item_status_idx").on(table.status),
    index("book_item_metadata_idx").on(table.bookMetadataId),
    index("book_item_condition_idx").on(table.condition),
  ],
);

export const borrowTransactionStatus = pgEnum("borrow_transaction_status", [
  "borrowed",
  "returned",
]);

export const borrowTransactions = pgTable(
  "borrow_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    customerId: uuid("customer_id")
      .references(() => customers.id, {
        onDelete: "cascade",
      })
      .notNull(),
    bookItemId: uuid("book_item_id")
      .references(() => bookItems.id, {
        onDelete: "cascade",
      })
      .notNull(),
    issuedBy: uuid("issued_by").references(() => users.id, {
      onDelete: "set null",
    }),
    returnedBy: uuid("returned_by").references(() => users.id, {
      onDelete: "set null",
    }),
    status: borrowTransactionStatus().default("borrowed").notNull(),

    dueDate: timestamp("due_date").notNull(),
    returnedAt: timestamp("returned_at"),

    fineAmount: decimal("fine_amount", { precision: 10, scale: 2 }),
    finePaidAt: timestamp("fine_paid_at"),
    fineReason: varchar("fine_reason", { length: 255 }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("borrow_customer_idx").on(table.customerId),
    index("borrow_book_item_idx").on(table.bookItemId),
    index("borrow_status_idx").on(table.status),
  ],
);

export const customersRelations = relations(customers, ({ many }) => ({
  borrowTransactions: many(borrowTransactions),
}));

export const bookMetadataRelation = relations(bookMetadatas, ({ many }) => ({
  bookItems: many(bookItems),
}));

export const bookItemRelation = relations(bookItems, ({ one }) => ({
  bookMetadata: one(bookMetadatas, {
    fields: [bookItems.bookMetadataId],
    references: [bookMetadatas.id],
  }),
}));

export const borrowTransactionRelations = relations(
  borrowTransactions,
  ({ one }) => ({
    customer: one(customers, {
      fields: [borrowTransactions.customerId],
      references: [customers.id],
    }),
    bookItem: one(bookItems, {
      fields: [borrowTransactions.bookItemId],
      references: [bookItems.id],
    }),
    issuedUser: one(users, {
      fields: [borrowTransactions.issuedBy],
      references: [users.id],
    }),
    returnedUser: one(users, {
      fields: [borrowTransactions.returnedBy],
      references: [users.id],
    }),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
