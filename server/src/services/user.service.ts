import pool from "../config/database";
import bcrypt from "bcryptjs";

export class UserService {

    // =====================================================
    // Get All Users
    // =====================================================
    static async getAll() {

        const sql = `
            SELECT
                u.user_id,
                u.first_name,
                u.last_name,
                u.username,
                u.email,
                u.phone_number,
                u.role_id,
                r.role_name,
                u.facility_id,
                f.facility_name,
                u.is_active,
                u.last_login
            FROM users u
            INNER JOIN roles r
                ON r.role_id = u.role_id
            LEFT JOIN facilities f
                ON f.facility_id = u.facility_id
            WHERE u.deleted_at IS NULL
            ORDER BY u.user_id DESC
        `;

        const [rows] = await pool.query(sql);

        return rows;

    }

    // =====================================================
    // Create User
    // =====================================================
    static async create(user: any) {

        const passwordHash = await bcrypt.hash(user.password, 10);

        const sql = `
            INSERT INTO users
            (
                role_id,
                facility_id,
                first_name,
                last_name,
                username,
                email,
                phone_number,
                password_hash
            )
            VALUES
            (?,?,?,?,?,?,?,?)
        `;

        const [result]: any = await pool.execute(sql, [

            user.role_id,
            user.facility_id ?? null,
            user.first_name,
            user.last_name,
            user.username,
            user.email,
            user.phone_number ?? null,
            passwordHash

        ]);

        return result.insertId;

    }

    // =====================================================
    // Check if Email Already Exists
    // =====================================================
    static async emailExists(email: string) {

        const [rows]: any = await pool.query(
            `SELECT user_id FROM users WHERE email = ? AND deleted_at IS NULL`,
            [email]
        );

        return rows.length > 0;

    }

    // =====================================================
    // Check if Username Already Exists
    // =====================================================
    static async usernameExists(username: string) {

        const [rows]: any = await pool.query(
            `SELECT user_id FROM users WHERE username = ? AND deleted_at IS NULL`,
            [username]
        );

        return rows.length > 0;

    }

    // =====================================================
    // Update User
    // =====================================================
    static async update(userId: number, user: any) {

        const sql = `
            UPDATE users
            SET
                first_name = ?,
                last_name = ?,
                phone_number = ?,
                role_id = ?,
                facility_id = ?
            WHERE user_id = ?
        `;

        const [result]: any = await pool.execute(sql, [

            user.first_name,
            user.last_name,
            user.phone_number ?? null,
            user.role_id,
            user.facility_id ?? null,
            userId

        ]);

        return result.affectedRows;

    }

    // =====================================================
    // Reset Password
    // =====================================================
    static async resetPassword(userId: number, newPassword: string) {

        const passwordHash = await bcrypt.hash(newPassword, 10);

        const sql = `
            UPDATE users
            SET password_hash = ?
            WHERE user_id = ?
        `;

        const [result]: any = await pool.execute(sql, [passwordHash, userId]);

        return result.affectedRows;

    }

    // =====================================================
    // Toggle Active Status
    // =====================================================
    static async setActiveStatus(userId: number, isActive: boolean) {

        const sql = `
            UPDATE users
            SET is_active = ?
            WHERE user_id = ?
        `;

        const [result]: any = await pool.execute(sql, [isActive ? 1 : 0, userId]);

        return result.affectedRows;

    }

}