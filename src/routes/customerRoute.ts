import { Router } from "express";

import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middlewares/validation.ts";
import {
  createCustomerBodySchema,
  updateCustomerBodySchema,
  customerParamsSchema,
  extendMembershipSchema,
  customerQuerySchema,
} from "../schemas/customerSchema.ts";
import { authenticate } from "../middlewares/authenticate.ts";
import {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  extendMembership,
} from "../controllers/customerController.ts";
import {
  createBorrowTransactionByCustomer,
  getBorrowTransactionByCustomer,
} from "../controllers/borrowTransactionController.ts";
import {
  createTransactionBodySchema,
  transactionParamsSchema,
  transactionQuerySchema,
} from "../schemas/borrowTransactionSchema.ts";

const customerRoute = Router();

// GET Customers
customerRoute.get(
  "/",
  authenticate,
  validateQuery(customerQuerySchema),
  getCustomers,
);

// GET ONE Customer
customerRoute.get(
  "/:id",
  authenticate,
  validateParams(customerParamsSchema),
  getCustomer,
);

// CREATE Customer
customerRoute.post(
  "/",
  authenticate,
  validateBody(createCustomerBodySchema),
  createCustomer,
);

// UPDATE Customer
customerRoute.put(
  "/:id",
  authenticate,
  validateParams(customerParamsSchema),
  validateBody(updateCustomerBodySchema),
  updateCustomer,
);

// DELETE Customer
customerRoute.delete(
  "/:id",
  authenticate,
  validateParams(customerParamsSchema),
  deleteCustomer,
);

// Extend Membership duration of customer
customerRoute.patch(
  "/:id/extend-membership",
  authenticate,
  validateParams(customerParamsSchema),
  validateBody(extendMembershipSchema),
  extendMembership,
);

// GET Transactions of a Customer
customerRoute.get(
  "/:id/transactions",
  authenticate,
  validateParams(transactionParamsSchema),
  validateQuery(transactionQuerySchema),
  getBorrowTransactionByCustomer,
);

// CREATE Transaction of a Customer
customerRoute.post(
  "/:id/transactions",
  authenticate,
  validateParams(transactionParamsSchema),
  validateBody(createTransactionBodySchema),
  createBorrowTransactionByCustomer,
);

export default customerRoute;
