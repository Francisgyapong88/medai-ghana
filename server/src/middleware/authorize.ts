import { Response, NextFunction } from "express";
import { AuthRequest } from "./authenticate";

// Role IDs, per the real `roles` table:
// 1 Super Administrator, 2 Administrator, 3 Doctor, 4 Nurse,
// 5 Laboratory Scientist, 6 Health Officer, 7 Receptionist, 8 Patient

export const ROLES = {
    SUPER_ADMIN: 1,
    ADMIN: 2,
    DOCTOR: 3,
    NURSE: 4,
    LAB_SCIENTIST: 5,
    HEALTH_OFFICER: 6,
    RECEPTIONIST: 7,
    PATIENT: 8,
};

export function authorize(...allowedRoles: number[]) {

    return (req: AuthRequest, res: Response, next: NextFunction) => {

        const userRole = Number(req.user.role);

        if (!allowedRoles.includes(userRole)) {

            return res.status(403).json({

                success: false,

                message: "You do not have permission to perform this action."

            });

        }

        next();

    };

}