import { Router } from "express";

import { MedicalHistoryController } from "../controllers/medicalHistory.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize, ROLES } from "../middleware/authorize";

const router = Router();

// =====================================================
// Get Patient's Medical History
// GET /api/medical-history/patient/:patientId
// =====================================================
router.get(
    "/patient/:patientId",
    authenticate,
    MedicalHistoryController.getByPatientId
);

// =====================================================
// Add Condition to Patient (clinical roles + admins only)
// POST /api/medical-history/patient/:patientId
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
    MedicalHistoryController.addToPatient
);

export default router;