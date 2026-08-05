import { Router } from "express";

import { AnalyticsController } from "../controllers/analytics.controller";
import { authenticate } from "../middleware/authenticate";

const router = Router();

// =====================================================
// Get Symptom Frequency
// GET /api/analytics/symptom-frequency
// =====================================================
router.get(
    "/symptom-frequency",
    authenticate,
    AnalyticsController.getSymptomFrequency
);

export default router;