import { useEffect, useRef, useState } from 'react'
import { registerPomodoroSession } from '../services/pomodoroService'

type PomodoroMode = 'focus' | 'break'

const FOCUS_TIME = 25 * 60
const BREAK_TIME = 5 * 60

export function usePomodoro() {
  const [mode, setMode] = useState<PomodoroMode>('focus')
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME)
  const [isRunning, setIsRunning] = useState(false)
  const [cyclesCompleted, setCyclesCompleted] = useState(0)

  const intervalRef = useRef<number | null>(null)

  // -------------------
  // Funções de controle
  // -------------------
  function start() {
    if (intervalRef.current) return // não cria múltiplos intervalos

    setIsRunning(true)
    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)
  }

  function pause() {
    setIsRunning(false)
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  function reset() {
    pause()
    setMode('focus')
    setTimeLeft(FOCUS_TIME)
    setCyclesCompleted(0)
  }

  // -------------------
  // Efeito para alternar ciclos e chamar backend
  // -------------------
  useEffect(() => {
    if (timeLeft > 0) return

    if (mode === 'focus') {
      setCyclesCompleted((prev) => prev + 1)

      // Salva no backend
      registerPomodoroSession().catch((err) => {
        console.error('Erro ao registrar sessão:', err)
      })

      // Passa para pausa
      setMode('break')
      setTimeLeft(BREAK_TIME)
    } else {
      // Passa para foco
      setMode('focus')
      setTimeLeft(FOCUS_TIME)
    }
  }, [timeLeft, mode])

  // -------------------
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