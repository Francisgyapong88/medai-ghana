import { Router } from "express";

import { AllergyController } from "../controllers/allergy.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize, ROLES } from "../middleware/authorize";

const router = Router();

// =====================================================
// Get All Allergy Options (for checkbox list)
// GET /api/allergies/options
// =====================================================
router.get(
    "/options",
    authenticate,
    AllergyController.getAllOptions
);

// =====================================================
// Get Patient's Allergies
// GET /api/allergies/patient/:patientId
// =====================================================
router.get(
    "/patient/:patientId",
    authenticate,
    AllergyController.getByPatientId
);

// =====================================================
// Add Allergy to Patient (clinical roles + admins only)
// POST /api/allergies/patient/:patientId
// =====================================================
router.post(
    "/patient/:patientId",
    authenticate,
    authorize(
        ROLES.SUPER_ADMIN,
        ROLES.ADMIN,
        ROLES.DOCTOR,
        ROLES.NURSE,
        ROLES.HEALTH_OFFICER,
        ROLES.LAB_SCIENTIST
    ),
    AllergyController.addToPatient
);

export default router;