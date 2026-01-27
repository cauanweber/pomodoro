import { prisma } from "../../lib/prisma"

export async function createSession(
  userId: string,
  type: "FOCUS" | "BREAK",
  duration: number
) {
  return prisma.pomodoroSession.create({
    data: {
      userId,
      type,
      duration,
    },
  })
}