import { Response } from "express";
import { validationResult } from "express-validator";

import { VisitService } from "../services/visit.service";
import { AuthRequest } from "../middleware/authenticate";

export class VisitController {

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

            const visitNumber =
                `VIS-${year}-${Date.now().toString().slice(-6)}`;

            const visit = {

                ...req.body,

                visit_number: visitNumber,

                created_by: req.user.userId

            };

            const visitId = await VisitService.create(visit);

            return res.status(201).json({

                success: true,

                visitId,

                visitNumber

            });

        }

        catch (error) {

            console.error(error);

            return res.status(500).json({

                success:false,

                message:"Failed to create visit."

            });

        }

    }

   static async getAll(req: AuthRequest, res: Response) {

        try {

            const visits = await VisitService.getAll();

            return res.status(200).json({

                success: true,

                data: visits

            });

        }

        catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,

                message: "Failed to retrieve visits."

            });

        }

    }

    static async getById(req: AuthRequest, res: Response) {

        try {

            const visit = await VisitService.getById(Number(req.params.id));

            if (!visit) {

                return res.status(404).json({

                    success: false,

                    message: "Visit not found."

                });

            }

            return res.status(200).json({

                success: true,

                data: visit

            });

        }

        catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,

                message: "Failed to retrieve visit."

            });

        }

    }

    static async update(req: AuthRequest, res: Response) {

        try {

            const updated = await VisitService.update(Number(req.params.id), req.body);

            if (!updated) {

                return res.status(404).json({

                    success: false,

                    message: "Visit not found."

                });

            }

            return res.status(200).json({

                success: true,

                message: "Visit updated successfully."

            });

        }

        catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,

                message: "Failed to update visit."

            });

        }

    }

    static async delete(req: AuthRequest, res: Response) {

        try {

            const deleted = await VisitService.delete(Number(req.params.id));

            if (!deleted) {

                return res.status(404).json({

                    success: false,

                    message: "Visit not found."

                });

            }

            return res.status(200).json({

                success: true,

                message: "Visit deleted successfully."

            });

        }

        catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,

                message: "Failed to delete visit."

            });

        }

    }

}