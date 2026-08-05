import { body } from "express-validator";

export const createPatientValidator = [

    body("first_name")
        .notEmpty()
        .withMessage("First name is required."),

    body("last_name")
        .notEmpty()
        .withMessage("Last name is required."),

    body("date_of_birth")
        .notEmpty()
        .withMessage("Date of birth is required."),

    body("gender_id")
        .isInt()
        .withMessage("Gender is required."),

    body("phone_number")
        .optional()
        .isLength({ min: 10, max: 20 }),

];