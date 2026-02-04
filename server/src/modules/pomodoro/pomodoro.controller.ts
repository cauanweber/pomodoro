import { Request, Response } from "express"
import * as service from "./pomodoro.service"
import { prisma } from "../../lib/prisma"

export async function create(req: Request, res: Response) {
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
}

export async function getSessions(req: Request, res: Response) {
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  const sessions = await prisma.pomodoroSession.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
  })

  return res.json(sessions)
}
