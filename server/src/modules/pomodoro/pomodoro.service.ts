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

export async function getSessions(userId: string, limit: number, offset: number) {
  return prisma.pomodoroSession.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  })
}
