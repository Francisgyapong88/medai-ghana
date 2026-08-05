import { Router } from "express";

import { UserController } from "../controllers/user.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize, ROLES } from "../middleware/authorize";

const router = Router();

// =====================================================
// Get All Users (Admins only)
// GET /api/users
// =====================================================
router.get(
    "/",
    authenticate,
    authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
    UserController.getAll
);

// =====================================================
// Create User (Admins only)
// POST /api/users
// =====================================================
router.post(
    "/",
    authenticate,
    authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
    UserController.create
);

// =====================================================
// Update User (Admins only)
// PUT /api/users/:id
// =====================================================
router.put(
    "/:id",
    authenticate,
    authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
    UserController.update
);

// =====================================================
// Reset User Password (Admins only)
// POST /api/users/:id/reset-password
// =====================================================
router.post(
    "/:id/reset-password",
    authenticate,
    authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
    UserController.resetPassword
);

// =====================================================
// Toggle User Active Status (Admins only)
// PATCH /api/users/:id/status
// =====================================================
router.patch(
    "/:id/status",
    authenticate,
    authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
    UserController.setActiveStatus
);

export default router;