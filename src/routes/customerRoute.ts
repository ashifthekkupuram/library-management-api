import { Router } from "express";

import { validateBody, validateParams } from "../middlewares/validation.ts";
import {
  createCustomerBodySchema,
  updateCustomerBodySchema,
  customerParamsSchema,
  extendMembershipSchema,
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

const customerRoute = Router();

// GET Customers
customerRoute.get("/", authenticate, getCustomers);

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

export default customerRoute;
