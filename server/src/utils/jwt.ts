import jwt from "jsonwebtoken";

const JWT_SECRET: string = process.env.JWT_SECRET ?? "medai_secret_key";
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ?? "1d") as jwt.SignOptions["expiresIn"];

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}