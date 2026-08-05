import { Router } from "express";

import { FacilityController } from "../controllers/facility.controller";
import { authenticate } from "../middleware/authenticate";

const router = Router();

// =====================================================
// Get All Facilities (any authenticated user)
// GET /api/facilities
// =====================================================
router.get(
    "/",
    authenticate,
    FacilityController.getAll
);

export default router;