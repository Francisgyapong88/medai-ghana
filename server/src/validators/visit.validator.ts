import { body } from "express-validator";

export const createVisitValidator = [

    body("patient_id")
        .notEmpty()
        .withMessage("Patient is required."),

    body("facility_id")
        .notEmpty()
        .withMessage("Facility is required."),

    body("department_id")
        .notEmpty()
        .withMessage("Department is required."),

    body("visit_type_id")
        .notEmpty()
        .withMessage("Visit type is required."),

    body("visit_status_id")
        .notEmpty()
        .withMessage("Visit status is required."),

    body("attended_by")
        .optional()
        .isInt()
        .withMessage("Attended by must be a valid user."),

    body("visit_date")
        .notEmpty()
        .withMessage("Visit date is required."),

    body("chief_complaint")
        .notEmpty()
        .withMessage("Chief complaint is required.")
];