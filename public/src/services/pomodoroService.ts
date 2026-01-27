import { api } from './api'

export async function registerPomodoroSession() {
  await api.post('/pomodoro/session', {
    type: 'FOCUS',
    duration: 25 * 60, // ou 10 para teste rápido
  })
}

export async function getPomodoroSessions() {
  const res = await api.get('/pomodoro/sessions')
  return res.data
}