import { Request, Response } from "express"
import * as service from "./pomodoro.service"

export async function create(req: Request, res: Response) {
  const { type, duration } = req.body

  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  const session = await service.createSession(
    req.userId,
    type,
    duration
  )

  return res.status(201).json(session)
}