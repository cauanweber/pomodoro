import { Request, Response } from "express"
import * as authService from "./auth.service"

export async function register(req: Request, res: Response) {
  const { email, password } = req.body
  const result = await authService.register(email, password)
  return res.status(201).json(result)
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body
  const result = await authService.login(email, password)
  return res.json(result)
}