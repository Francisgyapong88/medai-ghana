import { Response } from "express";
import { validationResult } from "express-validator";

import { PatientService } from "../services/patient.service";
import { AuthRequest } from "../middleware/authenticate";

export class PatientController {

    // =====================================================
    // Register Patient
    // =====================================================
    static async create(req: AuthRequest, res: Response) {

        try {

            const errors = validationResult(req);

            if (!errors.isEmpty()) {

                return res.status(400).json({

                    success: false,
                    errors: errors.array()

                });

            }

            const year = new Date().getFullYear();

            const patientNumber =
                `PAT-${year}-${Date.now().toString().slice(-6)}`;

            const patient = {

                ...req.body,

                patient_number: patientNumber,

                created_by: req.user.userId

            };

            const patientId = await PatientService.create(patient);

            return res.status(201).json({

                success: true,
                message: "Patient registered successfully.",
                patientId,
                patientNumber

            });

        }

        catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,
                message: "Failed to register patient."

            });

        }

    }

    // =====================================================
    // Get All Patients
    // =====================================================
    static async getAll(req: AuthRequest, res: Response) {

        try {

            const patients = await PatientService.getAll();

            return res.status(200).json({

                success: true,
                count: Array.isArray(patients) ? patients.length : 0,
                data: patients

            });

        }

        catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,
                message: "Failed to retrieve patients."

            });

        }

    }

    // =====================================================
    // Get Patient By ID
    // =====================================================
    static async getById(req: AuthRequest, res: Response) {

        try {

            const patientId = Number(req.params.id);

            const patient = await PatientService.getById(patientId);

            if (!patient) {

                return res.status(404).json({

                    success: false,
                    message: "Patient not found."

                });

            }

            return res.status(200).json({

                success: true,
                data: patient

            });

        }

        catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,
                message: "Failed to retrieve patient."

            });

        }

    }

    // =====================================================
    // Update Patient
    // =====================================================
    static async update(req: AuthRequest, res: Response) {

        try {

            const patientId = Number(req.params.id);

            const updated = await PatientService.update(patientId, req.body);

            if (!updated) {

                return res.status(404).json({

                    success: false,
                    message: "Patient not found."

                });

            }

            return res.status(200).json({

                success: true,
                message: "Patient updated successfully."

            });

        }

        catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,
                message: "Failed to update patient."

            });

        }

    }

    // =====================================================
    // Soft Delete Patient
    // =====================================================
    static async delete(req: AuthRequest, res: Response) {

        try {

            const patientId = Number(req.params.id);

            const deleted = await PatientService.delete(patientId);

            if (!deleted) {

                return res.status(404).json({

                    success: false,
                    message: "Patient not found."

                });

            }

            return res.status(200).json({

                success: true,
                message: "Patient deleted successfully."

            });

        }

        catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,
                message: "Failed to delete patient."

            });

        }

    }

    // =====================================================
    // Search Patients
    // =====================================================
    static async search(req: AuthRequest, res: Response) {

        try {

            const keyword = String(req.query.keyword || "");

            const patients = await PatientService.search(keyword);

            return res.status(200).json({

                success: true,
                count: Array.isArray(patients) ? patients.length : 0,
                data: patients

            });

        }

        catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,
                message: "Search failed."

            });

        }

    }

}