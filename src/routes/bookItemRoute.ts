import { Router } from "express";

import {
  getBookItems,
  getBookItem,
  updateBookItem,
  deleteBookItem,
} from "../controllers/bookItemController.ts";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middlewares/validation.ts";
import { authenticate } from "../middlewares/authenticate.ts";
import { admin } from "../middlewares/admin.ts";
import {
  updateBookItemBodySchema,
  bookItemParamsSchema,
  bookItemQuerySchema,
} from "../schemas/bookItemSchema.ts";

const bookItemRoute = Router();

// GET Book Items
bookItemRoute.get(
  "/",
  authenticate,
  validateQuery(bookItemQuerySchema),
  getBookItems,
);

// GET One Book Item
bookItemRoute.get(
  "/:id",
  authenticate,
  validateParams(bookItemParamsSchema),
  getBookItem,
);

// UPDATE One Book Item
bookItemRoute.patch(
  "/:id",
  authenticate,
  validateParams(bookItemParamsSchema),
  validateBody(updateBookItemBodySchema),
  updateBookItem,
);

// DELETE One Book Item
bookItemRoute.delete(
  "/:id",
  authenticate,
  admin,
  validateParams(bookItemParamsSchema),
  deleteBookItem,
);

export default bookItemRoute;
