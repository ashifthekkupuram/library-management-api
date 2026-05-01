import { z } from "zod";

export const registerBodySchema = z.object({
  username: z
    .string({ error: "Username is required." })
    .trim()
    .refine((value) => /^\S*$/.test(value ?? ""), "No white space allowed.")
    .min(4, "Username should have atleast 4 characters.")
    .max(16, "Username must be max 16 characters."),
  password: z
    .string({ error: "Password is required." })
    .refine(
      (value) => /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(value ?? ""),
      "Password must be at least 8 characters long and include at least one letter and one digit.",
    ),
});

export const loginBodySchema = z.object({
  username: z.string({ error: "Username is required." }),
  password: z.string({ error: "Password is required." }),
});
