import { Router } from "express";

import { register, login } from "../controllers/authController.ts";
import { validateBody } from "../middlewares/validation.ts";
import { registerBodySchema, loginBodySchema } from "../schemas/authSchema.ts";

const authRoute = Router();

authRoute.post("/register", validateBody(registerBodySchema), register);
authRoute.post("/login", validateBody(loginBodySchema), login);

export default authRoute;
