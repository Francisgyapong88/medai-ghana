import pool from "../config/database";

export class AnalyticsService {

    // =====================================================
    // Get Symptom Frequency (parses the JSON symptoms column
    // across all assessments and tallies real occurrences)
    // =====================================================
    static async getSymptomFrequency() {

        const [rows]: any = await pool.query(
            `
            SELECT symptoms
            FROM assessments
            WHERE deleted_at IS NULL
            AND symptoms IS NOT NULL
            `
        );

        const counts: Record<string, number> = {};

        for (const row of rows) {

            let symptomList: string[] = [];

            try {
                symptomList = JSON.parse(row.symptoms);
            } catch {
                continue;
            }

            for (const symptom of symptomList) {
                counts[symptom] = (counts[symptom] ?? 0) + 1;
            }

        }

        return Object.entries(counts)
            .map(([symptom, count]) => ({ symptom, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8);

    }

}