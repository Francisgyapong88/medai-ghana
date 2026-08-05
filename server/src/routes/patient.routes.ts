import { Router } from "express";

import { PatientController } from "../controllers/patient.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize, ROLES } from "../middleware/authorize";
import { createPatientValidator } from "../validators/patient.validator";

const router = Router();

// =====================================================
// Get All Patients
// GET /api/patients
// =====================================================
router.get(
    "/",
    authenticate,
    PatientController.getAll
);

// =====================================================
// Search Patients
// GET /api/patients/search?keyword=john
// =====================================================
router.get(
    "/search",
    authenticate,
    PatientController.search
);

// =====================================================
// Get Patient By ID
// GET /api/patients/1
// =====================================================
router.get(
    "/:id",
    authenticate,
    PatientController.getById
);

// =====================================================
// Register Patient
// POST /api/patients
// =====================================================
router.post(
    "/",
    authenticate,
    createPatientValidator,
    PatientController.create
);

// =====================================================
// Update Patient
// PUT /api/patients/1
// =====================================================
router.put(
    "/:id",
    authenticate,
    PatientController.update
);

// =====================================================
// Delete Patient (Soft Delete) - Admins only
// DELETE /api/patients/1
// =====================================================
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
    PatientController.delete
);

export default router;