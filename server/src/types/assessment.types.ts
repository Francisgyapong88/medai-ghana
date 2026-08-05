export interface AssessmentInput {

    visit_id: number;

    assessment_status_id: number;

    assessed_by: number;

    symptoms: string[];

    temperature?: number;

    blood_pressure?: string;

    blood_sugar?: number;

    heart_rate?: number;

    respiratory_rate?: number;

    oxygen_saturation?: number;

    weight?: number;

    height?: number;

    bmi?: number;

    gender?: string;

    age?: number;

    clinical_notes?: string;

}