import { Router } from "express";

import { register } from "../controllers/authController.ts";
import { validateBody } from "../middlewares/validation.ts";
import { registerBodySchema } from "../schemas/authSchema.ts";

const authRoute = Router();

authRoute.post("/register", validateBody(registerBodySchema), register);

export default authRoute;
