import { Request, Response, NextFunction } from "express"
import * as authService from "./auth.service"

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidPassword(password: string) {
  return password.length >= 6
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body

    if (typeof email !== "string" || !isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email" })
    }

    if (typeof password !== "string" || !isValidPassword(password)) {
      return res.status(400).json({ message: "Password must be at least 6 characters" })
    }

    const result = await authService.register(email, password)
    return res.status(201).json(result)
  } catch (error) {
    return next(error)
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body

    if (typeof email !== "string" || !isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email" })
    }

    if (typeof password !== "string" || !isValidPassword(password)) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const result = await authService.login(email, password)
    return res.json(result)
  } catch (error) {
    return next(error)
  }
}
