import { Response } from "express";

import { AllergyService } from "../services/allergy.service";
import { AuthRequest } from "../middleware/authenticate";

export class AllergyController {

    // =====================================================
    // Add Allergy to Patient
    // =====================================================
    static async addToPatient(req: AuthRequest, res: Response) {

        try {

            const patientId = Number(req.params.patientId);

            const allergyId = await AllergyService.addToPatient(patientId, req.body);

            return res.status(201).json({

                success: true,
                message: "Allergy added successfully.",
                allergyId

            });

        }

        catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,
                message: "Failed to add allergy."

            });

        }

    }

    // =====================================================
    // Get Patient's Allergies
    // =====================================================
    static async getByPatientId(req: AuthRequest, res: Response) {

        try {

            const patientId = Number(req.params.patientId);

            const allergies = await AllergyService.getByPatientId(patientId);

            return res.status(200).json({

                success: true,
                data: allergies

            });

        }

        catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,
                message: "Failed to retrieve allergies."

            });

        }

    }

    // =====================================================
    // Get All Allergy Options
    // =====================================================
    static async getAllOptions(req: AuthRequest, res: Response) {

        try {

            const options = await AllergyService.getAllOptions();

            return res.status(200).json({

                success: true,
                data: options

            });

        }

        catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,
                message: "Failed to retrieve allergy options."

            });

        }

    }

}