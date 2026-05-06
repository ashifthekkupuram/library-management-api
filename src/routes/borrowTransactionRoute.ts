import { Router } from "express";

import {
  returnBorrowedBook,
  payFineForReturnedBook,
  getBorrowedTransactions,
  getBorrowedTransaction,
} from "../controllers/borrowTransactionController.ts";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middlewares/validation.ts";
import {
  transactionParamsSchema,
  returnBookBodySchema,
  getTransactionsQuerySchema,
} from "../schemas/borrowTransactionSchema.ts";
import { authenticate } from "../middlewares/authenticate.ts";

const borrowTransactionRoute = Router();

// GET Transactions
borrowTransactionRoute.get(
  "/",
  authenticate,
  validateQuery(getTransactionsQuerySchema),
  getBorrowedTransactions,
);

// GET One Transaction
borrowTransactionRoute.get(
  "/:id",
  authenticate,
  validateParams(transactionParamsSchema),
  getBorrowedTransaction,
);

// Return book by Transaction ID
borrowTransactionRoute.post(
  "/:id/return",
  authenticate,
  validateParams(transactionParamsSchema),
  validateBody(returnBookBodySchema),
  returnBorrowedBook,
);

// Pay fine for returned book by Transaction ID
borrowTransactionRoute.post(
  "/:id/payfine",
  authenticate,
  validateParams(transactionParamsSchema),
  payFineForReturnedBook,
);

export default borrowTransactionRoute;
