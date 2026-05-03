import { z } from "zod";

export const bookMetaDataParamsSchema = z.object({
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

export const bookMetadataQuerySchema = z.object({
  page: z.coerce.number().default(1),
  query: z.string().default(""),
});

export const bookMetaDataBodySchema = z.object({
  name: z.string({ error: "Book Name is Required." }),
  author: z.string({ error: "Book Author is Required." }),
  releasedYear: z.coerce.number({ error: "Book Released Year is Required." }),
  iconUrl: z.string({ error: "Book Icon is Required." }),
});
