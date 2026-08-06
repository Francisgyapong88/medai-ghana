import pool from "../config/database";

export class VisitService {

    // Converts a JS Date, ISO string, or MySQL-style string into the
    // exact "YYYY-MM-DD HH:MM:SS" format MySQL's strict mode requires.
    // Local MariaDB was lenient about ISO format; Aiven's MySQL is not.
    private static toMysqlDatetime(value: any): string {

        const date = value ? new Date(value) : new Date();

        const pad = (n: number) => String(n).padStart(2, "0");

        return (
            date.getFullYear() + "-" +
            pad(date.getMonth() + 1) + "-" +
            pad(date.getDate()) + " " +
            pad(date.getHours()) + ":" +
            pad(date.getMinutes()) + ":" +
            pad(date.getSeconds())
        );

    }

    // =====================================================
    // Create Visit
    // =====================================================

    static async create(visit: any) {

       const sql = `
            INSERT INTO patient_visits
            (
                visit_number,
                patient_id,
                facility_id,
                department_id,
                visit_type_id,
                visit_status_id,
                attended_by,
                visit_date,
                chief_complaint,
                notes
            )
            VALUES
            (?,?,?,?,?,?,?,?,?,?)
        `;

        const [result]: any = await pool.execute(sql, [

            visit.visit_number,
            visit.patient_id,
            visit.facility_id,
            visit.department_id,
            visit.visit_type_id,
            visit.visit_status_id,
            visit.attended_by ?? null,
            VisitService.toMysqlDatetime(visit.visit_date),
            visit.chief_complaint ?? null,
            visit.notes ?? null

        ]);

        return result.insertId;

    }

    // =====================================================
    // Get All Visits
    // =====================================================

    static async getAll() {

        const sql = `
            SELECT
                v.visit_id,
                v.visit_number,
                p.patient_number,
                CONCAT(p.first_name,' ',p.last_name) AS patient_name,
                v.visit_date,
                v.chief_complaint
            FROM patient_visits v
            INNER JOIN patients p
                ON p.patient_id=v.patient_id
            WHERE v.deleted_at IS NULL
            ORDER BY v.visit_id DESC
        `;

        const [rows] = await pool.query(sql);

        return rows;

    }

    // =====================================================
    // Get Visit By ID
    // =====================================================

   static async getById(id:number){

        const sql=`
            SELECT *
            FROM patient_visits
            WHERE visit_id=?
            AND deleted_at IS NULL
            LIMIT 1
        `;

        const [rows]:any=await pool.query(sql,[id]);

        return rows[0];

    }

    // =====================================================
    // Update Visit
    // =====================================================

    static async update(id:number,visit:any){

        const sql=`
            UPDATE patient_visits
            SET
                chief_complaint=?,
                notes=?,
                visit_status_id=?
            WHERE visit_id=?
        `;

      const [result]:any=await pool.execute(sql,[

            visit.chief_complaint ?? null,
            visit.notes ?? null,
            visit.visit_status_id,
            id

        ]);

        return result.affectedRows;

    }

    // =====================================================
    // Soft Delete
    // =====================================================

    static async delete(id:number){

        const sql=`
            UPDATE patient_visits
            SET deleted_at=NOW()
            WHERE visit_id=?
        `;

        const [result]:any=await pool.execute(sql,[id]);

        return result.affectedRows;

    }

}