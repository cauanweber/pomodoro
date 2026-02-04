import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET

export function signToken(payload: object) {
  if (!JWT_SECRET) {
    throw new Error("JWT secret not configured")
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}
