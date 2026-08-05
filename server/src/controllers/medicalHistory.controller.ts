import { Response } from "express";

import { MedicalHistoryService } from "../services/medicalHistory.service";
import { AuthRequest } from "../middleware/authenticate";

export class MedicalHistoryController {

    // =====================================================
    // Add Condition to Patient
    // =====================================================
    static async addToPatient(req: AuthRequest, res: Response) {

        try {

            const patientId = Number(req.params.patientId);

            if (!req.body.condition_name) {

                return res.status(400).json({

                    success: false,
                    message: "Condition name is required."

                });

            }

            const historyId = await MedicalHistoryService.addToPatient(patientId, req.body);

            return res.status(201).json({

                success: true,
                message: "Medical history entry added successfully.",
                historyId

            });

        }

        catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,
                message: "Failed to add medical history entry."

            });

        }

    }

    // =====================================================
    // Get Patient's Medical History
    // =====================================================
    static async getByPatientId(req: AuthRequest, res: Response) {

        try {

            const patientId = Number(req.params.patientId);

            const history = await MedicalHistoryService.getByPatientId(patientId);

            return res.status(200).json({

                success: true,
                data: history

            });

        }

        catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,
                message: "Failed to retrieve medical history."

            });

        }

    }

}