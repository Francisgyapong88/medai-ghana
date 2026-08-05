import pool from "../config/database";

export class DashboardService {

    // =====================================================
    // Get Basic Counts
    // =====================================================
    static async getBasicCounts() {

        const [patientRows]: any = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM patients
            WHERE deleted_at IS NULL
            `
        );

        const [assessmentRows]: any = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM assessments
            WHERE deleted_at IS NULL
            `
        );

        

        const [todaysAssessmentRows]: any = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM assessments
            WHERE deleted_at IS NULL
            AND DATE(assessment_date) = CURDATE()
            `
        );

      return {

            totalPatients: patientRows[0].total,

            totalAssessments: assessmentRows[0].total,

            todaysAssessments: todaysAssessmentRows[0].total

        };

    }
    // =====================================================
    // Get Disease Distribution
    // =====================================================
    static async getDiseaseDistribution() {

        const sql = `
            SELECT
                d.disease_id,
                d.disease_name,
                COUNT(*) AS total
            FROM prediction_results pr
            INNER JOIN diseases d
                ON d.disease_id = pr.disease_id
            WHERE pr.ranking = 1
            GROUP BY d.disease_id, d.disease_name
            ORDER BY total DESC
        `;

        const [rows] = await pool.query(sql);

        return rows;

    }
// =====================================================
    // Get Weekly Trend (assessments per day, last 7 days)
    // =====================================================
  static async getWeeklyTrend() {

        const sql = `
            SELECT
                DATE_FORMAT(assessment_date, '%Y-%m-%d') AS date,
                COUNT(*) AS total
            FROM assessments
            WHERE deleted_at IS NULL
            AND assessment_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
            GROUP BY DATE_FORMAT(assessment_date, '%Y-%m-%d')
            ORDER BY date ASC
        `;

        const [rows] = await pool.query(sql);

        return rows;

    }

    // =====================================================
    // Get Recent Patients (with their latest AI prediction)
    // =====================================================
    static async getRecentPatients(limit: number = 5) {

        const sql = `
            SELECT
                p.patient_id,
                p.patient_number,
                CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
                a.assessment_id,
                DATE_FORMAT(a.assessment_date, '%Y-%m-%d %H:%i:%s') AS assessment_date,
                d.disease_name,
                pr.confidence_score
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
            WHERE a.deleted_at IS NULL
            ORDER BY a.assessment_date DESC
            LIMIT ?
        `;

        const [rows] = await pool.query(sql, [limit]);

        return rows;

    }
}