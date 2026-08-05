import { Response } from "express";

import { FacilityService } from "../services/facility.service";
import { AuthRequest } from "../middleware/authenticate";

export class FacilityController {

    static async getAll(req: AuthRequest, res: Response) {

        try {

            const facilities = await FacilityService.getAll();

            return res.status(200).json({

                success: true,

                data: facilities

            });

        }

        catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,

                message: "Failed to retrieve facilities."

            });

        }

    }

}