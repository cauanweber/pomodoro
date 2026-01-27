import { api } from './api'

export async function registerPomodoroSession() {
  await api.post('/pomodoro/sessions')
}