import pool from "../config/database";

export class FacilityService {

    // =====================================================
    // Get All Active Facilities
    // =====================================================
    static async getAll() {

        const sql = `
            SELECT
                f.facility_id,
                f.facility_name,
                f.facility_code,
                f.region,
                f.district,
                f.town,
                ft.facility_type_name
            FROM facilities f
            INNER JOIN facility_types ft
                ON ft.facility_type_id = f.facility_type_id
            WHERE f.is_active = 1
            AND f.deleted_at IS NULL
            ORDER BY f.region ASC, f.facility_name ASC
        `;

        const [rows] = await pool.query(sql);

        return rows;

    }

}