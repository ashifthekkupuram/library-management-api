import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.ts";
import {
  getBookMetadatas,
  getBookMetadata,
  createBookMetadata,
  updateBookMetadata,
  deleteBookMetadata,
} from "../controllers/bookMetadataController.ts";
import { admin } from "../middlewares/admin.ts";
import {
  bookMetaDataBodySchema,
  bookMetaDataParamsSchema,
  bookMetadataQuerySchema,
} from "../schemas/bookMetaDataSchema.ts";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middlewares/validation.ts";
import {
  bookItemBodySchema,
  bookItemParamsSchema,
  bookItemQuerySchema,
} from "../schemas/bookItemSchema.ts";
import {
  createBookItemByMetadata,
  getBookItemsByMetadata,
} from "../controllers/bookItemController.ts";

const bookMetadataRoute = Router();

// GET ALL Book Metadata
bookMetadataRoute.get(
  "/",
  authenticate,
  validateQuery(bookMetadataQuerySchema),
  getBookMetadatas,
);

// GET ONE Book Metadata
bookMetadataRoute.get(
  "/:id",
  authenticate,
  validateParams(bookMetaDataParamsSchema),
  getBookMetadata,
);

// CREATE ONE Book Metadata
bookMetadataRoute.post(
  "/",
  authenticate,
  admin,
  validateBody(bookMetaDataBodySchema),
  createBookMetadata,
);

// UPDATE ONE Book Metadata
bookMetadataRoute.put(
  "/:id",
  authenticate,
  admin,
  validateParams(bookMetaDataParamsSchema),
  validateBody(bookMetaDataBodySchema),
  updateBookMetadata,
);

// DELETE ONE Book Metadata
bookMetadataRoute.delete(
  "/:id",
  authenticate,
  admin,
  validateParams(bookMetaDataParamsSchema),
  deleteBookMetadata,
);

// GET Book Items By Metadata ID
bookMetadataRoute.get(
  "/:id/items",
  authenticate,
  validateParams(bookItemParamsSchema),
  validateQuery(bookItemQuerySchema),
  getBookItemsByMetadata,
);

// CREATE Book Items By Metadata ID
bookMetadataRoute.post(
  "/:id/items",
  authenticate,
  admin,
  validateParams(bookItemParamsSchema),
  validateBody(bookItemBodySchema),
  createBookItemByMetadata,
);

export default bookMetadataRoute;
