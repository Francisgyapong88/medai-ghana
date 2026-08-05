import pool from "../config/database";
import { PredictionFeatures } from "./featureExtraction.service";

export interface PredictionResult {

    disease_id: number;

    ranking: number;

    probability: number;

    confidence_score: number;

    explanation: string;

    recommended_action: string;

}

interface DiseaseSymptomMapping {
    symptom_name: string;
    importance_score: number;
}

// The four symptom-driven diseases we support, and their disease_id
// in the `diseases` table. Hypertension (disease_id 6) is handled
// separately below since it's vitals-based, not symptom-based.
const TARGET_DISEASES: Record<number, { name: string; recommendedAction: string }> = {

    1: {
        name: "Malaria",
        recommendedAction: "Perform malaria RDT or blood smear immediately."
    },

    2: {
        name: "Typhoid Fever",
        recommendedAction: "Request Widal test or blood culture."
    },

    3: {
        name: "Pneumonia",
        recommendedAction: "Order chest X-ray and monitor oxygen saturation."
    },

    7: {
        name: "Diabetes Mellitus",
        recommendedAction: "Confirm with a fasting blood glucose or HbA1c test."
    },

};

// Minimum weighted match (0-1) required for a disease to be included
// in the results at all.
const CONFIDENCE_THRESHOLD = 0.5;

export class RuleEngineService {

    static async predict(
        features: PredictionFeatures
    ): Promise<PredictionResult[]> {

        const symptoms = features.symptoms.map(s => s.toLowerCase());

        const predictions: PredictionResult[] = [];

        // ================================================
        // Symptom-based diseases, driven by disease_symptoms
        // ================================================
        for (const diseaseId of Object.keys(TARGET_DISEASES).map(Number)) {

            const [mappings]: any = await pool.query(

                `
                SELECT s.symptom_name, ds.importance_score
                FROM disease_symptoms ds
                INNER JOIN symptoms s
                    ON s.symptom_id = ds.symptom_id
                WHERE ds.disease_id = ?
                `,

                [diseaseId]

            );

            if (mappings.length === 0) continue;

            let matchedWeight = 0;
            let totalWeight = 0;

            const matchedSymptoms: string[] = [];

            for (const mapping of mappings as DiseaseSymptomMapping[]) {

                totalWeight += Number(mapping.importance_score);

                if (symptoms.includes(mapping.symptom_name.toLowerCase())) {

                    matchedWeight += Number(mapping.importance_score);

                    matchedSymptoms.push(mapping.symptom_name);

                }

            }

            const probability =
                totalWeight > 0 ? matchedWeight / totalWeight : 0;

            if (probability >= CONFIDENCE_THRESHOLD) {

                const disease = TARGET_DISEASES[diseaseId];

                predictions.push({

                    disease_id: diseaseId,

                    ranking: 0,

                    probability,

                    confidence_score: Math.round(probability * 100),

                    explanation:
                        `Matched symptoms (${matchedSymptoms.join(", ")}) are consistent with ${disease.name}.`,

                    recommended_action: disease.recommendedAction

                });

            }

        }

        // ================================================
        // HYPERTENSION (disease_id 6) - vitals-based
        // ================================================
        if (

            features.systolic_bp !== undefined &&
            features.systolic_bp >= 140

        ) {

            predictions.push({

                disease_id: 6,

                ranking: 0,

                probability: 0.90,

                confidence_score: 90,

                explanation:
                    `Elevated systolic blood pressure (${features.systolic_bp} mmHg) suggests hypertension.`,

                recommended_action:
                    "Repeat blood pressure measurement to confirm sustained hypertension."

            });

        }

        // ================================================
        // Rank by confidence, highest first
        // ================================================
        predictions.sort((a, b) => b.probability - a.probability);

        predictions.forEach((prediction, index) => {
            prediction.ranking = index + 1;
        });

        return predictions;

    }

}