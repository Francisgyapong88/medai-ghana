import pool from "../config/database";

export class HistoryService {

    // =====================================================
    // Get Full Assessment History (with top prediction + clinician)
    // =====================================================
    static async getAll() {

        const sql = `
            SELECT
                a.assessment_id,
                a.assessment_number,
                p.patient_id,
                p.patient_number,
                CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
                DATE_FORMAT(a.assessment_date, '%Y-%m-%d %H:%i:%s') AS assessment_date,
                ps.prediction_reference,
                ps.overall_confidence,
                ps.prediction_status,
                d.disease_id,
                d.disease_name,
                pr.confidence_score,
                pr.explanation,
                CONCAT(u.first_name, ' ', u.last_name) AS predicted_by_name
            FROM assessments a
            INNER JOIN patient_visits v
                ON v.visit_id = a.visit_id
            INNER JOIN patients p
                ON p.patient_id = v.patient_id
            LEFT JOIN prediction_sessions ps
                ON ps.assessment_id = a.assessment_id
            LEFT JOIN prediction_results pr
                ON pr.prediction_session_id = ps.prediction_session_id
                AND pr.ranking = 1
            LEFT JOIN diseases d
                ON d.disease_id = pr.disease_id
            LEFT JOIN users u
                ON u.user_id = ps.predicted_by
            WHERE a.deleted_at IS NULL
            ORDER BY a.assessment_date DESC
        `;

        const [rows] = await pool.query(sql);

        return rows;

    }

    // =====================================================
    // Get One Assessment's Full Prediction (for the detail/Prediction view)
    // =====================================================
    static async getByAssessmentId(assessmentId: number) {

        const [assessmentRows]: any = await pool.query(
            `
            SELECT
                a.assessment_id,
                a.assessment_number,
                a.symptoms,
                p.patient_id,
                p.patient_number,
                CONCAT(p.first_name, ' ', p.last_name) AS patient_name
            FROM assessments a
            INNER JOIN patient_visits v
                ON v.visit_id = a.visit_id
            INNER JOIN patients p
                ON p.patient_id = v.patient_id
            WHERE a.assessment_id = ?
            AND a.deleted_at IS NULL
            LIMIT 1
            `,
            [assessmentId]
        );

        const assessment = assessmentRows[0];

        if (!assessment) return null;

        const [sessionRows]: any = await pool.query(
            `
            SELECT prediction_session_id, prediction_reference, prediction_status
            FROM prediction_sessions
            WHERE assessment_id = ?
            LIMIT 1
            `,
            [assessmentId]
        );

        const session = sessionRows[0];

        let results: any[] = [];

        if (session) {

            const [resultRows]: any = await pool.query(
                `
                SELECT
                    disease_id,
                    ranking,
                    probability,
                    confidence_score,
                    explanation,
                    recommended_action
                FROM prediction_results
                WHERE prediction_session_id = ?
                ORDER BY ranking ASC
                `,
                [session.prediction_session_id]
            );

            results = resultRows;

        }

        let symptoms: string[] = [];

        try {
            symptoms = assessment.symptoms ? JSON.parse(assessment.symptoms) : [];
        } catch {
            symptoms = [];
        }

        return {

            assessmentId: assessment.assessment_id,
            assessmentNumber: assessment.assessment_number,
            patientName: assessment.patient_name,
            patientNumber: assessment.patient_number,
            symptoms,
            prediction: session ? {
                sessionId: session.prediction_session_id,
                predictionReference: session.prediction_reference,
                status: session.prediction_status,
                results
            } : null

        };

    }

}