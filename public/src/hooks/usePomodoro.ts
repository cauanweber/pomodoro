import { useEffect, useRef, useState } from 'react'
import { registerPomodoroSession } from '../services/pomodoroService'

type PomodoroMode = 'focus' | 'break'
type TimerState = 'idle' | 'running' | 'paused'

const FOCUS_TIME = 25 * 60
const BREAK_TIME = 5 * 60

export function usePomodoro() {
  const [mode, setMode] = useState<PomodoroMode>('focus')
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME)
  const [timerState, setTimerState] = useState<TimerState>('idle')
  const [cyclesCompleted, setCyclesCompleted] = useState(0)

  const intervalRef = useRef<number | null>(null)

  function stopInterval() {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  function start() {
    if (timerState === 'running') return // não cria múltiplos intervalos

    setTimerState('running')
    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
  }

  function pause() {
    if (timerState !== 'running') return
    setTimerState('paused')
    stopInterval()
  }

  function reset() {
    stopInterval()
    setTimerState('idle')
    setMode('focus')
    setTimeLeft(FOCUS_TIME)
    setCyclesCompleted(0)
  }

  function selectMode(nextMode: PomodoroMode) {
    stopInterval()
    setTimerState('idle')
    setMode(nextMode)
    setTimeLeft(nextMode === 'focus' ? FOCUS_TIME : BREAK_TIME)
  }

  useEffect(() => {
    if (timeLeft > 0) return

    stopInterval()
    setTimerState('idle')

    if (mode === 'focus') {
      setCyclesCompleted((prev) => prev + 1)

      registerPomodoroSession('FOCUS', FOCUS_TIME).catch((err) => {
        console.error('Erro ao registrar sessão:', err)
      })

      setMode('break')
      setTimeLeft(BREAK_TIME)
    } else {
      registerPomodoroSession('BREAK', BREAK_TIME).catch((err) => {
        console.error('Erro ao registrar sessão:', err)
      })

      setMode('focus')
      setTimeLeft(FOCUS_TIME)
    }
  }, [timeLeft, mode])

  return {
    mode,
    timeLeft,
    timerState,
    isRunning: timerState === 'running',
    cyclesCompleted,
    start,
    pause,
    reset,
    selectMode,
  }
}
