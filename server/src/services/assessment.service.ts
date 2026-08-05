import pool from "../config/database";

export class AssessmentService {

 // =====================================================
// Create Assessment
// =====================================================
static async create(assessment: any) {

    const sql = `
        INSERT INTO assessments
        (
            assessment_number,
            visit_id,
            assessment_status_id,
            assessed_by,
            symptoms,
            temperature,
            blood_pressure,
            blood_sugar,
            heart_rate,
            respiratory_rate,
            oxygen_saturation,
            weight,
            height,
            bmi,
            gender,
            age,
            clinical_notes
        )
        VALUES
        (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;

   const [result]: any = await pool.execute(sql, [

        assessment.assessment_number,

        assessment.visit_id,

        assessment.assessment_status_id,

        assessment.assessed_by,

        JSON.stringify(assessment.symptoms),

        assessment.temperature ?? null,

        assessment.blood_pressure ?? null,

        assessment.blood_sugar ?? null,

        assessment.heart_rate ?? null,

        assessment.respiratory_rate ?? null,

        assessment.oxygen_saturation ?? null,

        assessment.weight ?? null,

        assessment.height ?? null,

        assessment.bmi ?? null,

        assessment.gender ?? null,

        assessment.age ?? null,

        assessment.clinical_notes ?? null

    ]);

    return result.insertId;

}  

  // =====================================================
    // Get All Assessments
    // =====================================================
    static async getAll() {

        const sql = `
            SELECT
                assessment_id,
                assessment_number,
                visit_id,
                assessment_status_id,
                temperature,
                blood_pressure,
                heart_rate,
                assessment_date,
                created_at
            FROM assessments
            WHERE deleted_at IS NULL
            ORDER BY assessment_id DESC
        `;

        const [rows] = await pool.query(sql);

        return rows;

    

    }

    // =====================================================
    // Get Assessment By ID
    // =====================================================
    static async getById(id: number) {

        const sql = `
            SELECT *
            FROM assessments
            WHERE assessment_id = ?
            LIMIT 1
        `;

        const [rows]: any = await pool.query(sql, [id]);

        return rows[0];

    }

    // =====================================================
    // Update Assessment
    // =====================================================
    static async update(id: number, assessment: any) {
            const sql = `
    UPDATE assessments
    SET
        symptoms = ?,
        temperature = ?,
        blood_pressure = ?,
        blood_sugar = ?,
        heart_rate = ?,
        respiratory_rate = ?,
        oxygen_saturation = ?,
        weight = ?,
        height = ?,
        bmi = ?,
        gender = ?,
        age = ?,
        clinical_notes = ?
    WHERE assessment_id = ?
`;

const [result]: any = await pool.execute(sql, [

    JSON.stringify(assessment.symptoms),

    assessment.temperature,

    assessment.blood_pressure,

    assessment.blood_sugar,

    assessment.heart_rate,

    assessment.respiratory_rate,

    assessment.oxygen_saturation,

    assessment.weight,

    assessment.height,

    assessment.bmi,

    assessment.gender,

    assessment.age,

    assessment.clinical_notes,

    id

]);

        return result.affectedRows;

    }

    // =====================================================
    // Soft Delete Assessment
    // =====================================================
    static async delete(id: number) {

        const sql = `
            UPDATE assessments
            SET deleted_at = NOW()
            WHERE assessment_id = ?
        `;

        const [result]: any = await pool.execute(sql, [id]);

        return result.affectedRows;

    }

}