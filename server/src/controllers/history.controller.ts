import { Response } from "express";

import { HistoryService } from "../services/history.service";
import { AuthRequest } from "../middleware/authenticate";

export class HistoryController {

    static async getAll(req: AuthRequest, res: Response) {

        try {

            const history = await HistoryService.getAll();

            return res.status(200).json({

                success: true,

                count: Array.isArray(history) ? history.length : 0,

                data: history

            });

        }

        catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,

                message: "Failed to retrieve assessment history."

            });

        }

    }

    static async getByAssessmentId(req: AuthRequest, res: Response) {

        try {

            const result = await HistoryService.getByAssessmentId(Number(req.params.assessmentId));

            if (!result) {

                return res.status(404).json({
                    success: false,
                    message: "Assessment not found."
                });

            }

            return res.status(200).json({

                success: true,

                data: result

            });

        }

        catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,

                message: "Failed to retrieve assessment detail."

            });

        }

    }

}