import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "medai_secret_key";

export interface AuthRequest extends Request {
    user?: any;
}

export const authenticate = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Access token is required."
        });
    }

    const token = authHeader.startsWith("Bearer ")
        ? authHeader.substring(7)
        : authHeader;

    try {

        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = decoded;

        next();

    } catch {

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token."
        });

    }

};