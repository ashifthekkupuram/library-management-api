import { z } from "zod";

export const bookItemParamsSchema = z.object({
  id: z
    .string({ error: "ID param is required." })
    .refine(
      (value) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
          value ?? "",
        ),
      { error: "Invalid ID" },
    ),
});

export const bookItemQuerySchema = z.object({
  page: z.coerce.number().default(1),
  condition: z
    .enum(["good", "damaged", "lost"], {
      error: "Condition must be good, damaged or lost.",
    })
    .optional(),
  status: z
    .enum(["available", "borrowed", "reserved"], {
      error: "Status must be available, borrowed or reserved.",
    })
    .optional(),
});

export const bookItemBodySchema = z.object({
  quantity: z.coerce
    .number({ error: "Quantity must be a number." })
    .min(1, "quantity needed to atleast one.")
    .default(1),
  condition: z
    .enum(["good", "damaged", "lost"], {
      error: "Condition must be good, damaged or lost.",
    })
    .default("good"),
});
