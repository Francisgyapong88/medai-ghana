import { Response } from "express";
import { validationResult } from "express-validator";

import { AuthRequest } from "../middleware/authenticate";
import { AssessmentService } from "../services/assessment.service";
import { PredictionService } from "../services/prediction.service";

export class AssessmentController {

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

            const assessmentNumber =
                `ASM-${year}-${Date.now().toString().slice(-6)}`;

            const assessment = {

                ...req.body,

                assessment_number: assessmentNumber,

                assessed_by: req.user.userId

            };

            const assessmentId =
                await AssessmentService.create(assessment);

            // Immediately run AI prediction
            const prediction =
                await PredictionService.runPrediction({

                    assessmentId,

                    visit_id: assessment.visit_id,

                    predicted_by: req.user.userId

                });

            return res.status(201).json({

                success: true,

                message: "Assessment completed successfully.",

                assessmentId,

                assessmentNumber,

                prediction

            });

        }

        catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,

                message: "Assessment failed."

            });

        }

    }
// ============================================
    // Get All Assessments
    // ============================================
    static async getAll(req: AuthRequest, res: Response) {

        try {

            const assessments =
                await AssessmentService.getAll();

            return res.status(200).json({

                success: true,

                count: Array.isArray(assessments)
                    ? assessments.length
                    : 0,

                data: assessments

            });

        }

        catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,

                message: "Failed to retrieve assessments."

            });

        }

    }

    // ============================================
    // Get Assessment By ID
    // ============================================
    static async getById(req: AuthRequest, res: Response) {

        try {

            const assessment =
                await AssessmentService.getById(
                    Number(req.params.id)
                );

            if (!assessment) {

                return res.status(404).json({

                    success: false,

                    message: "Assessment not found."

                });

            }

            return res.status(200).json({

                success: true,

                data: assessment

            });

        }

        catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,

                message: "Failed to retrieve assessment."

            });

        }

    }

    // ============================================
    // Update Assessment
    // ============================================
    static async update(req: AuthRequest, res: Response) {

        try {

            const updated =
                await AssessmentService.update(

                    Number(req.params.id),

                    req.body

                );

            if (!updated) {

                return res.status(404).json({

                    success: false,

                    message: "Assessment not found."

                });

            }

            return res.status(200).json({

                success: true,

                message: "Assessment updated successfully."

            });

        }

        catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,

                message: "Failed to update assessment."

            });

        }

    }

    // ============================================
    // Delete Assessment
    // ============================================
    static async delete(req: AuthRequest, res: Response) {

        try {

            const deleted =
                await AssessmentService.delete(
                    Number(req.params.id)
                );

            if (!deleted) {

                return res.status(404).json({

                    success: false,

                    message: "Assessment not found."

                });

            }

            return res.status(200).json({

                success: true,

                message: "Assessment deleted successfully."

            });

        }

        catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,

                message: "Failed to delete assessment."

            });

        }

    }
}