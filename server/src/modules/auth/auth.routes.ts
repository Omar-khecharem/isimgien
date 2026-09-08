import { Router } from "express";
import * as authController from "./auth.controller";
import { validate } from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import { loginSchema } from "./auth.validation";

const router = Router();

router.post(
  "/login",
  validate(loginSchema),
  authController.login
);

router.get("/me", authenticate, authController.me);

router.post("/refresh", authController.refresh);

router.post("/logout", authController.logout);

export default router;
