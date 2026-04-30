CREATE TYPE "public"."book_item_condition" AS ENUM('good', 'damaged', 'lost');--> statement-breakpoint
CREATE TYPE "public"."book_item_status" AS ENUM('available', 'borrowed', 'reserved');--> statement-breakpoint
CREATE TYPE "public"."borrow_transaction_status" AS ENUM('borrowed', 'returned');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'librarian');--> statement-breakpoint
CREATE TABLE "book_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"book_metadata_id" uuid NOT NULL,
	"status" "book_item_status" DEFAULT 'available' NOT NULL,
	"condition" "book_item_condition" DEFAULT 'good' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "book_metadatas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"author" varchar(100) NOT NULL,
	"released_year" integer NOT NULL,
	"icon_url" varchar(556) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "borrow_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"book_item_id" uuid NOT NULL,
	"issued_by" uuid,
	"returned_by" uuid,
	"status" "borrow_transaction_status" DEFAULT 'borrowed' NOT NULL,
	"due_date" timestamp NOT NULL,
	"returned_at" timestamp,
	"fine_amount" numeric(10, 2),
	"fine_paid_at" timestamp,
	"fine_reason" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" varchar(12) NOT NULL,
	"email" varchar(255),
	"name" varchar(100) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"membership_id" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customers_phone_unique" UNIQUE("phone"),
	CONSTRAINT "customers_email_unique" UNIQUE("email"),
	CONSTRAINT "customers_membership_id_unique" UNIQUE("membership_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(50) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'librarian' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "book_items" ADD CONSTRAINT "book_items_book_metadata_id_book_metadatas_id_fk" FOREIGN KEY ("book_metadata_id") REFERENCES "public"."book_metadatas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "borrow_transactions" ADD CONSTRAINT "borrow_transactions_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "borrow_transactions" ADD CONSTRAINT "borrow_transactions_book_item_id_book_items_id_fk" FOREIGN KEY ("book_item_id") REFERENCES "public"."book_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "borrow_transactions" ADD CONSTRAINT "borrow_transactions_issued_by_users_id_fk" FOREIGN KEY ("issued_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "borrow_transactions" ADD CONSTRAINT "borrow_transactions_returned_by_users_id_fk" FOREIGN KEY ("returned_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "book_item_status_idx" ON "book_items" USING btree ("status");--> statement-breakpoint
CREATE INDEX "book_item_metadata_idx" ON "book_items" USING btree ("book_metadata_id");--> statement-breakpoint
CREATE INDEX "book_item_condition_idx" ON "book_items" USING btree ("condition");--> statement-breakpoint
CREATE INDEX "book_metadata_name_idx" ON "book_metadatas" USING btree ("name");--> statement-breakpoint
CREATE INDEX "book_metadata_author_idx" ON "book_metadatas" USING btree ("author");--> statement-breakpoint
CREATE INDEX "borrow_customer_idx" ON "borrow_transactions" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "borrow_book_item_idx" ON "borrow_transactions" USING btree ("book_item_id");--> statement-breakpoint
CREATE INDEX "borrow_status_idx" ON "borrow_transactions" USING btree ("status");

-- creating unique index for book_item_id and borrowed status cannot be exist at the same time in borrowed_transaction table (custom added) 👇
CREATE UNIQUE INDEX unique_active_borrow
ON borrow_transactions (book_item_id)
WHERE status = 'borrowed';