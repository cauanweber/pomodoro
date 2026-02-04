import { Request, Response, NextFunction } from "express"
import * as service from "./pomodoro.service"

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { type, duration } = req.body

    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    if (type !== 'FOCUS' && type !== 'BREAK') {
      return res.status(400).json({ message: 'Invalid session type' })
    }

    if (typeof duration !== 'number' || duration < 60) {
      return res.status(400).json({ message: 'Invalid duration' })
    }

    const session = await service.createSession(
      req.userId,
      type,
      duration
    )

    return res.status(201).json(session)
  } catch (error) {
    return next(error)
  }
}

export async function getSessions(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(String(req.query.limit ?? "20"), 10)),
    )
    const offset = Math.max(0, Number.parseInt(String(req.query.offset ?? "0"), 10))

    const sessions = await service.getSessions(req.userId, limit, offset)

    return res.json(sessions)
  } catch (error) {
    return next(error)
  }
}
