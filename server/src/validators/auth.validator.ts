import { body } from "express-validator";
import { EMAIL_REGEX } from "../utils/emailValidator";

export const loginValidator = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .matches(EMAIL_REGEX)
    .withMessage("Please enter a valid email address (e.g. name@example.com)."),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];