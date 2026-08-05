import pool from "../config/database";
import bcrypt from "bcryptjs";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface AuthUser extends RowDataPacket {
  user_id: number;
  role_id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone_number: string | null;
  password_hash: string;
  is_active: number;
  email_verified: number;
}

class AuthService {

  static async findByEmail(email: string): Promise<AuthUser | null> {

    const [rows] = await pool.query<AuthUser[]>(
      `
      SELECT *
      FROM users
      WHERE email = ?
      AND deleted_at IS NULL
      LIMIT 1
      `,
      [email]
    );

    return rows.length ? rows[0] : null;
  }

  static async findById(userId: number): Promise<AuthUser | null> {

    const [rows] = await pool.query<AuthUser[]>(
      `
      SELECT *
      FROM users
      WHERE user_id = ?
      AND deleted_at IS NULL
      LIMIT 1
      `,
      [userId]
    );

    return rows.length ? rows[0] : null;
  }

  static async comparePassword(
    password: string,
    hash: string
  ): Promise<boolean> {

    return bcrypt.compare(password, hash);

  }

  static async updateLastLogin(userId: number): Promise<void> {

    await pool.query<ResultSetHeader>(
      `
      UPDATE users
      SET last_login = NOW()
      WHERE user_id = ?
      `,
      [userId]
    );

  }

  static async updateProfile(
    userId: number,
    profile: { first_name: string; last_name: string; phone_number: string | null }
  ): Promise<void> {

    await pool.query<ResultSetHeader>(
      `
      UPDATE users
      SET first_name = ?, last_name = ?, phone_number = ?
      WHERE user_id = ?
      `,
      [profile.first_name, profile.last_name, profile.phone_number, userId]
    );

  }

  static async updatePassword(userId: number, newPassword: string): Promise<void> {

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await pool.query<ResultSetHeader>(
      `
      UPDATE users
      SET password_hash = ?
      WHERE user_id = ?
      `,
      [passwordHash, userId]
    );

  }

}

export default AuthService;