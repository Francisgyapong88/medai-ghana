import { PredictionFeatures } from "./featureExtraction.service";
import { PredictionResult } from "./ruleEngine.service";

// URL of the separately-running Python Flask microservice that hosts
// the trained Random Forest model. Configurable via .env in case the
// service ever runs on a different host/port (e.g. in production).
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:5001";

// Maps the disease name STRINGS returned by the trained model back to
// the real disease_id values used throughout the rest of the app,
// plus the same clinical recommended_action text used by the rule
// engine, so both engines produce consistent-looking results.
const DISEASE_NAME_TO_ID: Record<string, { id: number; recommendedAction: string }> = {

    "Malaria": {
        id: 1,
        recommendedAction: "Perform malaria RDT or blood smear immediately."
    },

    "Typhoid": {
        id: 2,
        recommendedAction: "Request Widal test or blood culture."
    },

    "Pneumonia": {
        id: 3,
        recommendedAction: "Order chest X-ray and monitor oxygen saturation."
    },

    "Diabetes": {
        id: 7,
        recommendedAction: "Confirm with a fasting blood glucose or HbA1c test."
    },

};

// Minimum probability (0-1) for the model's prediction to be included
// in the final results at all - avoids surfacing near-zero "noise"
// predictions for diseases the model is confident it's NOT looking at.
const CONFIDENCE_THRESHOLD = 0.15;

export class MLPredictionService {

    static async predict(
        features: PredictionFeatures
    ): Promise<PredictionResult[]> {

        const predictions: PredictionResult[] = [];

        // ================================================
        // Call the Flask microservice for the 4 symptom-driven
        // diseases the trained model actually knows about.
        // ================================================
        const response = await fetch(`${ML_SERVICE_URL}/predict`, {

            method: "POST",

            headers: { "Content-Type": "application/json" },

            body: JSON.stringify({ symptoms: features.symptoms || [] }),

        });

        if (!response.ok) {

            throw new Error(
                `ML service responded with status ${response.status}. Is the Flask service running on ${ML_SERVICE_URL}?`
            );

        }

        const data = await response.json();

        if (!data.success) {

            throw new Error(data.message || "ML service returned an unsuccessful response.");

        }

        for (const result of data.predictions) {

            const mapping = DISEASE_NAME_TO_ID[result.disease];

            // Guard against the model ever returning a disease name we
            // don't recognize (shouldn't happen, but fail safely rather
            // than crash if it ever does).
            if (!mapping) continue;

            if (result.probability < CONFIDENCE_THRESHOLD) continue;

            const matchedSymptoms = (features.symptoms || []).join(", ") || "no symptoms reported";

            predictions.push({

                disease_id: mapping.id,

                ranking: 0,

                probability: result.probability,

                confidence_score: Math.round(result.probability * 100),

                explanation:
                    `The trained machine learning model, based on reported symptoms (${matchedSymptoms}), estimates a ${Math.round(result.probability * 100)}% likelihood of this condition.`,

                recommended_action: mapping.recommendedAction

            });

        }

        // ================================================
        // HYPERTENSION (disease_id 6) - vitals-based, NOT part of
        // the trained ML model (diagnosed by blood pressure
        // measurement, not symptom presentation - see project
        // documentation for the reasoning behind this decision).
        // ================================================
        if (
            features.systolic_bp !== undefined &&
            features.systolic_bp !== null &&
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