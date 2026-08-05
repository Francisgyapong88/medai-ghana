import pool from "../config/database";
import { AIService } from "./ai.service";
import { AssessmentService } from "./assessment.service";
import { FeatureExtractionService, PredictionFeatures } from "./featureExtraction.service";

export class PredictionService {

  static async runPrediction(data: any) {

    const predictionReference = `PRED-${Date.now()}`;

    // ==========================================
    // Use Current Production AI Model
    // ==========================================

    const [models]: any = await pool.query(

        `
        SELECT model_id
        FROM ai_models
        WHERE status='Production'
        LIMIT 1
        `

    );

    if (models.length === 0) {

        throw new Error("No production AI model found.");

    }

    const modelId = models[0].model_id;

    // ==========================================
    // Fetch the assessment and build prediction features
    // ==========================================

    const assessment = await AssessmentService.getById(data.assessmentId);

    if (!assessment) {

        throw new Error("Assessment not found.");

    }

    // blood_pressure is stored as a single "120/80" string --
    // split it into the two numbers the engines expect.
    let systolic_bp: number | undefined;
    let diastolic_bp: number | undefined;

    if (assessment.blood_pressure) {

        const parts = String(assessment.blood_pressure).split("/");

        if (parts.length === 2) {
            systolic_bp = Number(parts[0]);
            diastolic_bp = Number(parts[1]);
        }

    }

    // symptoms is stored as a JSON string -- parse it back to an array.
    let symptoms: string[] = [];

    try {
        symptoms = assessment.symptoms ? JSON.parse(assessment.symptoms) : [];
    } catch {
        symptoms = [];
    }

    const features: PredictionFeatures = await FeatureExtractionService.extract({

        symptoms,

        age: assessment.age ?? undefined,

        gender: assessment.gender ?? undefined,

        // DECIMAL columns come back from mysql2 as strings -- convert explicitly.
        temperature: assessment.temperature !== null ? Number(assessment.temperature) : undefined,

        pulse_rate: assessment.heart_rate ?? undefined,

        respiratory_rate: assessment.respiratory_rate ?? undefined,

        systolic_bp,

        diastolic_bp

    });

    // ==========================================
    // Run the AI engine (rule-based or ML, per AI_ENGINE)
    // ==========================================

    let results: any[] = [];
    let status: "Completed" | "Failed" = "Completed";

    try {

        results = await AIService.predict(features);

    } catch (error) {

        console.error("AI prediction failed:", error);

        status = "Failed";

    }

    const overallConfidence =
        results.length > 0 ? results[0].confidence_score : null;

    // ==========================================
    // Save the prediction session (single insert, final status)
    // ==========================================

    const [session]: any = await pool.execute(

        `
        INSERT INTO prediction_sessions
        (
            prediction_reference,
            visit_id,
            assessment_id,
            model_id,
            predicted_by,
            overall_confidence,
            prediction_status,
            input_features
        )
        VALUES
        (?,?,?,?,?,?,?,?)
        `,

        [

            predictionReference,

            data.visit_id,

            data.assessmentId,

            modelId,

            data.predicted_by ?? null,

            overallConfidence,

            status,

            JSON.stringify(features)

        ]

    );

    const sessionId = session.insertId;

    // ==========================================
    // Save each individual prediction result
    // ==========================================

    for (const result of results) {

        await pool.execute(

            `
            INSERT INTO prediction_results
            (
                prediction_session_id,
                disease_id,
                ranking,
                confidence_score,
                probability,
                explanation,
                recommended_action
            )
            VALUES
            (?,?,?,?,?,?,?)
            `,

            [

                sessionId,

                result.disease_id,

                result.ranking,

                result.confidence_score,

                result.probability,

                result.explanation,

                result.recommended_action

            ]

        );

    }

    return {

        sessionId,

        predictionReference,

        status,

        results

    };

  }

}