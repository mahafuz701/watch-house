import { Router } from "express";
import { authLimiter } from "../../middleware/rateLimit";
import { requireAuth, optionalAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import * as schemas from "./auth.schemas";
import * as ctrl from "./auth.controller";

export const authRouter = Router();

authRouter.post("/register", authLimiter, validate(schemas.registerSchema), ctrl.doRegister);
authRouter.post("/login", authLimiter, validate(schemas.loginSchema), ctrl.doLogin);
authRouter.post("/refresh", ctrl.doRefresh);
authRouter.post("/logout", optionalAuth, ctrl.doLogout);
authRouter.post("/forgot-password", authLimiter, validate(schemas.forgotSchema), ctrl.doForgot);
authRouter.post("/reset-password", authLimiter, validate(schemas.resetPasswordSchema), ctrl.doReset);
authRouter.get("/me", requireAuth, ctrl.doMe);