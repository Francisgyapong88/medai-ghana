import { Response } from "express";

import { UserService } from "../services/user.service";
import { AuthRequest } from "../middleware/authenticate";

export class UserController {

    // =====================================================
    // Get All Users
    // =====================================================
    static async getAll(req: AuthRequest, res: Response) {

        try {

            const users = await UserService.getAll();

            return res.status(200).json({

                success: true,

                count: Array.isArray(users) ? users.length : 0,

                data: users

            });

        }

        catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,

                message: "Failed to retrieve users."

            });

        }

    }

    // =====================================================
    // Create User
    // =====================================================
    static async create(req: AuthRequest, res: Response) {

        try {

            const { first_name, last_name, username, email, password, role_id, facility_id, phone_number } = req.body;

            if (!first_name || !last_name || !username || !email || !password || !role_id) {

                return res.status(400).json({

                    success: false,

                    message: "First name, last name, username, email, password, and role are required."

                });

            }

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(email)) {

                return res.status(400).json({

                    success: false,

                    message: "Please enter a valid email address."

                });

            }

            if (password.length < 8) {

                return res.status(400).json({

                    success: false,

                    message: "Password must be at least 8 characters."

                });

            }

            const emailTaken = await UserService.emailExists(email);

            if (emailTaken) {

                return res.status(409).json({

                    success: false,

                    message: "A user with this email already exists."

                });

            }

            const usernameTaken = await UserService.usernameExists(username);

            if (usernameTaken) {

                return res.status(409).json({

                    success: false,

                    message: "This username is already taken."

                });

            }

            const userId = await UserService.create({
                first_name, last_name, username, email, password, role_id, facility_id, phone_number
            });

            return res.status(201).json({

                success: true,

                message: "User created successfully.",

                userId

            });

        }

        catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,

                message: "Failed to create user."

            });

        }

    }

    // =====================================================
    // Update User
    // =====================================================
    static async update(req: AuthRequest, res: Response) {

        try {

            const { first_name, last_name, phone_number, role_id, facility_id } = req.body;

            if (!first_name || !last_name || !role_id) {

                return res.status(400).json({

                    success: false,

                    message: "First name, last name, and role are required."

                });

            }

            const updated = await UserService.update(Number(req.params.id), {
                first_name, last_name, phone_number, role_id, facility_id
            });

            if (!updated) {

                return res.status(404).json({
                    success: false,
                    message: "User not found."
                });

            }

            return res.status(200).json({

                success: true,

                message: "User updated successfully."

            });

        }

        catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,

                message: "Failed to update user."

            });

        }

    }

    // =====================================================
    // Reset Password
    // =====================================================
    static async resetPassword(req: AuthRequest, res: Response) {

        try {

            const { newPassword } = req.body;

            if (!newPassword || newPassword.length < 8) {

                return res.status(400).json({

                    success: false,

                    message: "New password must be at least 8 characters."

                });

            }

            const updated = await UserService.resetPassword(Number(req.params.id), newPassword);

            if (!updated) {

                return res.status(404).json({
                    success: false,
                    message: "User not found."
                });

            }

            return res.status(200).json({

                success: true,

                message: "Password reset successfully."

            });

        }

        catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,

                message: "Failed to reset password."

            });

        }

    }

    // =====================================================
    // Toggle Active Status
    // =====================================================
    static async setActiveStatus(req: AuthRequest, res: Response) {

        try {

            const { isActive } = req.body;

            const updated = await UserService.setActiveStatus(Number(req.params.id), Boolean(isActive));

            if (!updated) {

                return res.status(404).json({
                    success: false,
                    message: "User not found."
                });

            }

            return res.status(200).json({

                success: true,

                message: isActive ? "User activated successfully." : "User deactivated successfully."

            });

        }

        catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,

                message: "Failed to update user status."

            });

        }

    }

}