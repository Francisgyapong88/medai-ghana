import pool from "../config/database";

export class MedicalHistoryService {

    // =====================================================
    // Add Condition to Patient
    // =====================================================
    static async addToPatient(patientId: number, condition: any) {

        const sql = `
            INSERT INTO medical_histories
            (
                patient_id,
                condition_name,
                diagnosis_date,
                status,
                notes
            )
            VALUES
            (?,?,?,?,?)
        `;

        const [result]: any = await pool.execute(sql, [

            patientId,
            condition.condition_name,
            condition.diagnosis_date ?? null,
            condition.status ?? null,
            condition.notes ?? null

        ]);

        return result.insertId;

    }

    // =====================================================
    // Get Patient's Medical History
    // =====================================================
    static async getByPatientId(patientId: number) {

        const sql = `
            SELECT
                history_id,
                condition_name,
                diagnosis_date,
                status,
                notes,
                created_at
            FROM medical_histories
            WHERE patient_id = ?
            AND deleted_at IS NULL
            ORDER BY history_id DESC
        `;

        const [rows] = await pool.query(sql, [patientId]);

        return rows;

    }

}