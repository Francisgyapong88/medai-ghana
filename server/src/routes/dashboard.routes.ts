import { Router } from "express";

import { DashboardController } from "../controllers/dashboard.controller";
import { authenticate } from "../middleware/authenticate";

const router = Router();

// =====================================================
// Get Basic Counts
// GET /api/dashboard/counts
// =====================================================
router.get(
    "/counts",
    authenticate,
    DashboardController.getBasicCounts
);
// =====================================================
// Get Disease Distribution
// GET /api/dashboard/disease-distribution
// =====================================================
router.get(
    "/disease-distribution",
    authenticate,
    DashboardController.getDiseaseDistribution
);

// =====================================================
// Get Weekly Trend
// GET /api/dashboard/weekly-trend
// =====================================================
router.get(
    "/weekly-trend",
    authenticate,
    DashboardController.getWeeklyTrend
);

// =====================================================
// Get Recent Patients
// GET /api/dashboard/recent-patients
// =====================================================
router.get(
    "/recent-patients",
    authenticate,
    DashboardController.getRecentPatients
);

export default router;