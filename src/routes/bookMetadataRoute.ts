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
} from "../schemas/bookMetaDataSchema.ts";
import { validateBody, validateParams } from "../middlewares/validation.ts";

const bookMetadataRoute = Router();

// GET ALL Book Metadata
bookMetadataRoute.get("/", authenticate, getBookMetadatas);

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

export default bookMetadataRoute;
