import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization
  if (!header) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  const [, token] = header.split(" ")

  const secret = process.env.JWT_SECRET
  if (!secret) {
    return res.status(500).json({ message: "JWT secret not configured" })
  }

  try {
    const decoded = jwt.verify(token, secret) as {
      sub: string
    }

    req.userId = decoded.sub

    return next()
  } catch {
    return res.status(401).json({ message: "Invalid token" })
  }
}
