import { Router } from "express";
import * as authController from "./auth.controller";
import { validate } from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import { uploadAvatar } from "../../middleware/upload.middleware";
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

router.post(
  "/avatar",
  authenticate,
  uploadAvatar.single("avatar"),
  authController.uploadAvatar
);

export default router;
