import { Response } from "express";

import { DashboardService } from "../services/dashboard.service";
import { AuthRequest } from "../middleware/authenticate";

export class DashboardController {

    // =====================================================
    // Get Basic Counts
    // =====================================================
    static async getBasicCounts(req: AuthRequest, res: Response) {

        try {

            const counts = await DashboardService.getBasicCounts();

            return res.status(200).json({

                success: true,

                data: counts

            });

        }

        catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,

                message: "Failed to retrieve dashboard counts."

            });

        }

    }
// =====================================================
    // Get Disease Distribution
    // =====================================================
    static async getDiseaseDistribution(req: AuthRequest, res: Response) {

        try {

            const distribution = await DashboardService.getDiseaseDistribution();

            return res.status(200).json({

                success: true,

                data: distribution

            });

        }

        catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,

                message: "Failed to retrieve disease distribution."

            });

        }

    }
// =====================================================
    // Get Weekly Trend
    // =====================================================
    static async getWeeklyTrend(req: AuthRequest, res: Response) {

        try {

            const trend = await DashboardService.getWeeklyTrend();

            return res.status(200).json({

                success: true,

                data: trend

            });

        }

        catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,

                message: "Failed to retrieve weekly trend."

            });

        }

    }

    // =====================================================
    // Get Recent Patients
    // =====================================================
    static async getRecentPatients(req: AuthRequest, res: Response) {

        try {

            const patients = await DashboardService.getRecentPatients();

            return res.status(200).json({

                success: true,

                data: patients

            });

        }

        catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,

                message: "Failed to retrieve recent patients."

            });

        }

    }
}