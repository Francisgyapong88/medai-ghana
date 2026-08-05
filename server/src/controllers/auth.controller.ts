import { Request, Response } from "express";
import AuthService from "../services/auth.service";
import { generateToken } from "../utils/jwt";
import { validationResult } from "express-validator";
import { AuthRequest } from "../middleware/authenticate";



export class AuthController {

  static async login(req: Request, res: Response) {

    try {
        
      const errors = validationResult(req);

if (!errors.isEmpty()) {
  return res.status(400).json({
    success: false,
    errors: errors.array(),
  });
}

      const { email, password } = req.body;

      const user = await AuthService.findByEmail(email);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password"
        });
      }

      if (!user.is_active) {
        return res.status(403).json({
          success: false,
          message: "Account has been disabled"
        });
      }

      const passwordMatch = await AuthService.comparePassword(
        password,
        user.password_hash
      );

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password"
        });
      }

      await AuthService.updateLastLogin(user.user_id);

      const token = generateToken({
        userId: user.user_id,
        email: user.email,
        role: String(user.role_id)
      });

      return res.status(200).json({

        success: true,

        token,

        user: {

          id: user.user_id,

          firstName: user.first_name,

          lastName: user.last_name,

          username: user.username,

          email: user.email,

          roleId: user.role_id

        }

      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({

        success: false,

        message: "Internal Server Error"

      });

    }

  }

  // =====================================================
  // Get My Own Profile
  // =====================================================
  static async me(req: AuthRequest, res: Response) {

    try {

      const user = await AuthService.findById(req.user.userId);

      if (!user) {

        return res.status(404).json({
          success: false,
          message: "User not found."
        });

      }

      return res.status(200).json({

        success: true,

        user: {

          id: user.user_id,

          firstName: user.first_name,

          lastName: user.last_name,

          username: user.username,

          email: user.email,

          phoneNumber: user.phone_number,

          roleId: user.role_id

        }

      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({

        success: false,

        message: "Internal Server Error"

      });

    }

  }

  // =====================================================
  // Update My Own Profile
  // =====================================================
  static async updateMe(req: AuthRequest, res: Response) {

    try {

      const { firstName, lastName, phoneNumber } = req.body;

      if (!firstName || !lastName) {

        return res.status(400).json({
          success: false,
          message: "First name and last name are required."
        });

      }

      await AuthService.updateProfile(req.user.userId, {
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber ?? null
      });

      return res.status(200).json({

        success: true,

        message: "Profile updated successfully."

      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({

        success: false,

        message: "Internal Server Error"

      });

    }

  }

  // =====================================================
  // Change My Own Password
  // =====================================================
  static async changePassword(req: AuthRequest, res: Response) {

    try {

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {

        return res.status(400).json({
          success: false,
          message: "Current password and new password are required."
        });

      }

      if (newPassword.length < 8) {

        return res.status(400).json({
          success: false,
          message: "New password must be at least 8 characters."
        });

      }

      const user = await AuthService.findById(req.user.userId);

      if (!user) {

        return res.status(404).json({
          success: false,
          message: "User not found."
        });

      }

      const passwordMatch = await AuthService.comparePassword(
        currentPassword,
        user.password_hash
      );

      if (!passwordMatch) {

        return res.status(401).json({
          success: false,
          message: "Current password is incorrect."
        });

      }

      await AuthService.updatePassword(req.user.userId, newPassword);

      return res.status(200).json({

        success: true,

        message: "Password updated successfully."

      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({

        success: false,

        message: "Internal Server Error"

      });

    }

  }

}