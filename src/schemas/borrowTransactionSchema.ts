import { z } from "zod";

export const transactionParamsSchema = z.object({
  id: z
    .string({ error: "ID param required." })
    .refine(
      (value) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
          value ?? "",
        ),
      { error: "Invalid ID" },
    ),
});

export const transactionQuerySchema = z.object({
  page: z.coerce.number().default(1),
  status: z
    .enum(["borrowed", "returned"], {
      error: "Status must be borrowed or returned.",
    })
    .optional(),
});

export const createTransactionBodySchema = z.object({
  bookMetadataId: z
    .string({ error: "Book Metadata ID required." })
    .refine(
      (value) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
          value ?? "",
        ),
      { error: "Invalid Book Metadata ID" },
    ),
});

export const returnBookBodySchema = z.object({
  condition: z.enum(["good", "damaged", "lost"], {
    error: "Condition required and it must be good damaged or lost.",
  }),
});

export const getTransactionsQuerySchema = z.object({
  page: z.coerce.number().default(1),
  status: z
    .enum(["borrowed", "returned"], {
      error: "Status must be borrowed or returned.",
    })
    .optional(),
  customerId: z
    .string()
    .refine(
      (value) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
          value ?? "",
        ),
      { error: "Invalid Customer ID" },
    )
    .optional(),
  bookItemId: z
    .string()
    .refine(
      (value) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
          value ?? "",
        ),
      { error: "Invalid Book Item ID" },
    )
    .optional(),
});
