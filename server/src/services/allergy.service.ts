import pool from "../config/database";

export class AllergyService {

    // =====================================================
    // Add Allergy to Patient
    // =====================================================
    static async addToPatient(patientId: number, allergy: any) {

        const sql = `
            INSERT INTO patient_allergies
            (
                patient_id,
                allergy_id,
                reaction,
                diagnosed_date,
                notes
            )
            VALUES
            (?,?,?,?,?)
        `;

        const [result]: any = await pool.execute(sql, [

            patientId,
            allergy.allergy_id,
            allergy.reaction ?? null,
            allergy.diagnosed_date ?? null,
            allergy.notes ?? null

        ]);

        return result.insertId;

    }

    // =====================================================
    // Get Patient's Allergies
    // =====================================================
    static async getByPatientId(patientId: number) {

        const sql = `
            SELECT
                pa.patient_allergy_id,
                pa.reaction,
                pa.diagnosed_date,
                pa.notes,
                a.allergy_id,
                a.allergy_name,
                a.allergy_type,
                a.severity_level
            FROM patient_allergies pa
            INNER JOIN allergies a
                ON a.allergy_id = pa.allergy_id
            WHERE pa.patient_id = ?
            ORDER BY pa.patient_allergy_id DESC
        `;

        const [rows] = await pool.query(sql, [patientId]);

        return rows;

    }

    // =====================================================
    // Get All Allergy Options (for the checkbox list)
    // =====================================================
    static async getAllOptions() {

        const sql = `
            SELECT allergy_id, allergy_name, allergy_type, severity_level
            FROM allergies
            oRDER BY allergy_type, allergy_name
        `;

        const [rows] = await pool.query(sql);

        return rows;

    }

}