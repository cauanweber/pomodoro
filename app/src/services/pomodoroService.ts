import { api } from './api'
import type { PomodoroSession } from '../types/pomodoro'

type SessionType = 'FOCUS' | 'BREAK'

export async function registerPomodoroSession(
  type: SessionType,
  duration: number,
) {
  await api.post('/pomodoro/session', {
    type,
    duration,
  })
}

export async function getPomodoroSessions(): Promise<PomodoroSession[]> {
  const res = await api.get<PomodoroSession[]>('/pomodoro/sessions')
  return res.data
}
