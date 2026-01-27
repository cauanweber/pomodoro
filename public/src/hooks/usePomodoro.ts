import { useEffect, useRef, useState } from 'react'

import { registerPomodoroSession } from '../services/pomodoroService'

type PomodoroMode = 'focus' | 'break'

const FOCUS_TIME = 25 * 60 // 25 min
const BREAK_TIME = 5 * 60 // 5 min

export function usePomodoro() {
  const [mode, setMode] = useState<PomodoroMode>('focus')
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME)
  const [isRunning, setIsRunning] = useState(false)
  const [cyclesCompleted, setCyclesCompleted] = useState(0)

  const intervalRef = useRef<number | null>(null)

  function start() {
    setIsRunning(true)
  }

  function pause() {
    setIsRunning(false)
  }

  function reset() {
    setIsRunning(false)
    setMode('focus')
    setTimeLeft(FOCUS_TIME)
    setCyclesCompleted(0)
  }

  useEffect(() => {
    if (timeLeft > 0) return

    if (mode === 'focus') {
      setCyclesCompleted((prev) => prev + 1)
      registerPomodoroSession().catch(() => {})
      setMode('break')
      setTimeLeft(BREAK_TIME)
    } else {
      setMode('focus')
      setTimeLeft(FOCUS_TIME)
    }
  }, [timeLeft, mode])

  useEffect(() => {
    if (timeLeft > 0) return

    if (mode === 'focus') {
      setCyclesCompleted((prev) => prev + 1)
      setMode('break')
      setTimeLeft(BREAK_TIME)
    } else {
      setMode('focus')
      setTimeLeft(FOCUS_TIME)
    }
  }, [timeLeft, mode])

  return {
    mode,
    timeLeft,
    isRunning,
    cyclesCompleted,
    start,
    pause,
    reset,
  }
}