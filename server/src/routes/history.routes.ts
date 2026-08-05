import { Router } from "express";

import { HistoryController } from "../controllers/history.controller";
import { authenticate } from "../middleware/authenticate";

const router = Router();

// =====================================================
// Get Full Assessment History
// GET /api/history
// =====================================================
router.get(
    "/",
    authenticate,
    HistoryController.getAll
);

// =====================================================
// Get One Assessment's Full Prediction
// GET /api/history/:assessmentId
// =====================================================
router.get(
    "/:assessmentId",
    authenticate,
    HistoryController.getByAssessmentId
);

export default router;