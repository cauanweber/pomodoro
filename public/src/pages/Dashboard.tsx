import { usePomodoro } from '../hooks/usePomodoro'

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export function Dashboard() {
  const {
    mode,
    timeLeft,
    isRunning,
    cyclesCompleted,
    start,
    pause,
    reset,
  } = usePomodoro()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-bold">
        {mode === 'focus' ? 'Foco' : 'Pausa'}
      </h1>

      <span className="text-6xl font-mono">
        {formatTime(timeLeft)}
      </span>

      <div className="flex gap-4">
        {!isRunning ? (
          <button
            onClick={start}
            className="px-6 py-2 bg-green-600 text-white rounded"
          >
            Start
          </button>
        ) : (
          <button
            onClick={pause}
            className="px-6 py-2 bg-yellow-500 text-white rounded"
          >
            Pause
          </button>
        )}

        <button
          onClick={reset}
          className="px-6 py-2 bg-red-600 text-white rounded"
        >
          Reset
        </button>
      </div>

      <p className="text-sm text-gray-500">
        Ciclos concluídos: {cyclesCompleted}
      </p>
    </div>
  )
}