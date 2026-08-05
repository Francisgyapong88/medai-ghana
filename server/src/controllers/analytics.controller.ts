import { Response } from "express";

import { AnalyticsService } from "../services/analytics.service";
import { AuthRequest } from "../middleware/authenticate";

export class AnalyticsController {

    static async getSymptomFrequency(req: AuthRequest, res: Response) {

        try {

            const data = await AnalyticsService.getSymptomFrequency();

            return res.status(200).json({

                success: true,

                data

            });

        }

        catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,

                message: "Failed to retrieve symptom frequency."

            });

        }

    }

}