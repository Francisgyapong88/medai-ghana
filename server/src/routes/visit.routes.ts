import { Router } from "express";

import { VisitController } from "../controllers/visit.controller";
import { authenticate } from "../middleware/authenticate";
import { createVisitValidator } from "../validators/visit.validator";

const router = Router();

// =========================================
// Get All Visits
// =========================================
router.get(
    "/",
    authenticate,
    VisitController.getAll
);

// =========================================
// Get Visit By ID
// =========================================
router.get(
    "/:id",
    authenticate,
    VisitController.getById
);

// =========================================
// Create Visit
// =========================================
router.post(
    "/",
    authenticate,
    createVisitValidator,
    VisitController.create
);

// =========================================
// Update Visit
// =========================================
router.put(
    "/:id",
    authenticate,
    VisitController.update
);

// =========================================
// Delete Visit
// =========================================
router.delete(
    "/:id",
    authenticate,
    VisitController.delete
);

export default router;