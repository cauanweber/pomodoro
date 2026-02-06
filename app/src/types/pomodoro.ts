export type PomodoroSession = {
  id: string
  type: 'FOCUS' | 'BREAK'
  duration: number
  completedAt: string
}