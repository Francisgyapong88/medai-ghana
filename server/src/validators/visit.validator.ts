import { body } from "express-validator";

export const createVisitValidator = [

    body("patient_id")
        .isInt()
        .withMessage("A valid patient is required."),

    body("facility_id")
        .isInt()
        .withMessage("A valid facility is required."),

    body("department_id")
        .isInt()
        .withMessage("A valid department is required."),

    body("visit_type_id")
        .isInt()
        .withMessage("A valid visit type is required."),

    body("visit_status_id")
        .isInt()
        .withMessage("A valid visit status is required."),

    body("visit_date")
        .notEmpty()
        .withMessage("Visit date is required."),

    body("chief_complaint")
        .optional({ checkFalsy: true })
        .isLength({ max: 1000 })
        .withMessage("Chief complaint must be under 1000 characters."),

    body("notes")
        .optional({ checkFalsy: true })
        .isLength({ max: 2000 })
        .withMessage("Notes must be under 2000 characters."),

];