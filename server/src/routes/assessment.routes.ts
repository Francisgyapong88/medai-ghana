import { Router } from "express";

import { AssessmentController } from "../controllers/assessment.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize, ROLES } from "../middleware/authorize";
import { createAssessmentValidator } from "../validators/assessment.validator";

const router = Router();

// ==============================================
// Get All Assessments
// GET /api/assessments
// ==============================================
router.get(
    "/",
    authenticate,
    AssessmentController.getAll
);

// ==============================================
// Get Assessment By ID
// GET /api/assessments/:id
// ==============================================
router.get(
    "/:id",
    authenticate,
    AssessmentController.getById
);

// ==============================================
// Create Assessment (clinical roles only)
// POST /api/assessments
// ==============================================
router.post(
    "/",
    authenticate,
    authorize(
        ROLES.SUPER_ADMIN,
        ROLES.ADMIN,
        ROLES.DOCTOR,
        ROLES.NURSE,
        ROLES.HEALTH_OFFICER,
        ROLES.LAB_SCIENTIST
    ),
    createAssessmentValidator,
    AssessmentController.create
);

// ==============================================
// Update Assessment
// PUT /api/assessments/:id
// ==============================================
router.put(
    "/:id",
    authenticate,
    AssessmentController.update
);

// ==============================================
// Delete Assessment
// DELETE /api/assessments/:id
// ==============================================
router.delete(
    "/:id",
    authenticate,
    AssessmentController.delete
);

export default router;