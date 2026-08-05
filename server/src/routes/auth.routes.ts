import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { loginValidator } from "../validators/auth.validator";
import { authenticate } from "../middleware/authenticate";

const router = Router();

router.post(
  "/login",
  loginValidator,
  AuthController.login
);

// =====================================================
// Get My Own Profile
// GET /api/auth/me
// =====================================================
router.get(
  "/me",
  authenticate,
  AuthController.me
);

// =====================================================
// Update My Own Profile
// PUT /api/auth/me
// =====================================================
router.put(
  "/me",
  authenticate,
  AuthController.updateMe
);

// =====================================================
// Change My Own Password
// POST /api/auth/change-password
// =====================================================
router.post(
  "/change-password",
  authenticate,
  AuthController.changePassword
);

export default router;