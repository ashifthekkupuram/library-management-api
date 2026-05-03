import { z } from "zod";

export const customerParamsSchema = z.object({
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

export const customerQuerySchema = z.object({
  page: z.coerce.number().default(1),
  query: z.string().default(""),
});

export const createCustomerBodySchema = z.object({
  phone: z
    .string({ error: "Phone Number is required." })
    .length(12, { error: "Phone Number must have 12 digits" })
    .refine((value) => /^\d+$/.test(value ?? ""), {
      error: "Invalid Phone Number.",
    }),
  email: z.email({ error: "Invalid Email." }).optional(),
  name: z
    .string({ error: "Name is required." })
    .min(4, "Name must have minimum 4 Alphabets."),
  membershipDurationMonth: z
    .number()
    .min(1, "Atleast need to take one month membership.")
    .max(12, "Can only go upto 12 months.")
    .default(1),
});

export const updateCustomerBodySchema = z.object({
  phone: z
    .string({ error: "Phone Number is required." })
    .length(12, { error: "Phone Number must have 12 digits" })
    .refine((value) => /^\d+$/.test(value ?? ""), {
      error: "Invalid Phone Number.",
    }),
  email: z.email({ error: "Invalid Email." }).optional(),
  name: z.string().min(4, "Name must have minimum 4 Alphabets."),
});

export const extendMembershipSchema = z.object({
  membershipDurationMonth: z
    .number()
    .min(1, "Atleast need to take one month membership.")
    .max(12, "Can only go upto 12 months.")
    .default(1),
});
