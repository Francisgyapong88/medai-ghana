export interface PredictionFeatures {

    symptoms: string[];

    age?: number;

    gender?: string;

    temperature?: number;

    pulse_rate?: number;

    respiratory_rate?: number;

    systolic_bp?: number;

    diastolic_bp?: number;

}

export class FeatureExtractionService {

    static async extract(assessment: any): Promise<PredictionFeatures> {

        /**
         * For now,
         * extract directly from assessment data.
         *
         * Later this service will query:
         *
         * - symptoms
         * - vitals
         * - laboratory
         * - medical history
         */

        return {

            symptoms: assessment.symptoms || [],

            age: assessment.age,

            gender: assessment.gender,

            temperature: assessment.temperature,

            pulse_rate: assessment.pulse_rate,

            respiratory_rate: assessment.respiratory_rate,

            systolic_bp: assessment.systolic_bp,

            diastolic_bp: assessment.diastolic_bp

        };

    }

}