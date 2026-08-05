import { body } from "express-validator";

export const createAssessmentValidator = [

    body("visit_id")
        .notEmpty()
        .withMessage("Visit is required."),

    body("assessment_status_id")
        .notEmpty()
        .withMessage("Assessment status is required."),

    body("symptoms")
        .isArray({ min: 1 })
        .withMessage("At least one symptom is required."),

    body("temperature")
        .optional({ nullable: true, checkFalsy: true })
        .isNumeric(),

    body("blood_pressure")
        .optional({ nullable: true, checkFalsy: true })
        .matches(/^\d{2,3}\/\d{2,3}$/)
        .withMessage("Blood pressure must be in the format systolic/diastolic, e.g. 120/80."),

    body("blood_sugar")
        .optional({ nullable: true, checkFalsy: true })
        .isNumeric(),

    body("heart_rate")
        .optional({ nullable: true, checkFalsy: true })
        .isNumeric(),

    body("respiratory_rate")
        .optional({ nullable: true, checkFalsy: true })
        .isNumeric(),

    body("oxygen_saturation")
        .optional({ nullable: true, checkFalsy: true })
        .isNumeric(),

    body("weight")
        .optional({ nullable: true, checkFalsy: true })
        .isNumeric(),

    body("height")
        .optional({ nullable: true, checkFalsy: true })
        .isNumeric(),

    body("bmi")
        .optional({ nullable: true, checkFalsy: true })
        .isNumeric(),

    body("gender")
        .optional({ nullable: true, checkFalsy: true })
        .isIn(["Male", "Female", "Other"])
        .withMessage("Gender must be Male, Female, or Other."),

    body("age")
        .optional({ nullable: true, checkFalsy: true })
        .isInt({ min: 0, max: 130 }),

    body("clinical_notes")
        .optional({ nullable: true, checkFalsy: true })

];