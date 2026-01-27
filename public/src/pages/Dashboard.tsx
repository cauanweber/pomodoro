import { usePomodoro } from '../hooks/usePomodoro'
import { useEffect, useState } from 'react'
import { getPomodoroSessions } from '../services/pomodoroService'

type Session = {
  id: string
  type: string
  duration: number
  createdAt: string
  completedAt: string
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export function Dashboard() {
  const { mode, timeLeft, isRunning, cyclesCompleted, start, pause, reset } = usePomodoro()
  const [sessions, setSessions] = useState<Session[]>([])

  // -----------------------------
  // Busca histórico do backend
  // -----------------------------
  async function fetchSessions() {
    try {
      const data = await getPomodoroSessions()
      setSessions(data)
    } catch (err) {
      console.error('Erro ao buscar sessões:', err)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  // Atualiza automaticamente após cada ciclo concluído
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSessions()
    }, 5000) // a cada 5s
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-bold">{mode === 'focus' ? 'Foco' : 'Pausa'}</h1>

      <span className="text-6xl font-mono">{formatTime(timeLeft)}</span>

      <div className="flex gap-4">
        {!isRunning ? (
          <button onClick={start} className="px-6 py-2 bg-green-600 text-white rounded">Start</button>
        ) : (
          <button onClick={pause} className="px-6 py-2 bg-yellow-500 text-white rounded">Pause</button>
        )}
        <button onClick={reset} className="px-6 py-2 bg-red-600 text-white rounded">Reset</button>
      </div>

      <p className="text-sm text-gray-500">Ciclos concluídos: {cyclesCompleted}</p>

      <h2 className="text-xl font-bold mt-6">Histórico de Sessões</h2>
      <ul className="flex flex-col gap-2">
        {sessions.map((s) => (
          <li key={s.id} className="px-4 py-2 bg-gray-200 rounded w-64">
            {s.type} - {formatTime(s.duration)} - {new Date(s.completedAt).toLocaleTimeString()}
          </li>
        ))}
      </ul>
    </div>
  )
}