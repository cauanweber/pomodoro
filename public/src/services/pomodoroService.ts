import { api } from './api'
import type { PomodoroSession } from '../types/pomodoro'

export async function registerPomodoroSession() {
  await api.post('/pomodoro/session', {
    type: 'FOCUS',
    duration: 25 * 60,
  })
}

export async function getPomodoroSessions(): Promise<PomodoroSession[]> {
  const res = await api.get<PomodoroSession[]>('/pomodoro/sessions')
  return res.data
}