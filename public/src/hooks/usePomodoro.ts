import { useEffect, useRef, useState } from 'react'
import { registerPomodoroSession } from '../services/pomodoroService'

type PomodoroMode = 'focus' | 'break'
type TimerState = 'idle' | 'running' | 'paused'

const DEFAULT_FOCUS_TIME = 25 * 60
const DEFAULT_BREAK_TIME = 5 * 60
const STORAGE_KEY = 'pomodoro:settings'

export function usePomodoro() {
  const [mode, setMode] = useState<PomodoroMode>('focus')
  const [focusDuration, setFocusDuration] = useState(DEFAULT_FOCUS_TIME)
  const [breakDuration, setBreakDuration] = useState(DEFAULT_BREAK_TIME)
  const [timeLeft, setTimeLeft] = useState(DEFAULT_FOCUS_TIME)
  const [autoStart, setAutoStart] = useState(true)
  const [timerState, setTimerState] = useState<TimerState>('idle')
  const [cyclesCompleted, setCyclesCompleted] = useState(0)

  const intervalRef = useRef<number | null>(null)

  function stopInterval() {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return

    try {
      const parsed = JSON.parse(stored) as {
        focus?: number
        break?: number
        autoStart?: boolean
      }

      if (parsed.focus && parsed.break && parsed.focus > 0 && parsed.break > 0) {
        setFocusDuration(parsed.focus)
        setBreakDuration(parsed.break)
        setTimeLeft(parsed.focus)
      }

      if (typeof parsed.autoStart === 'boolean') {
        setAutoStart(parsed.autoStart)
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  function start() {
    if (timerState === 'running') return // não cria múltiplos intervalos

    setTimerState('running')
    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
  }

  function startWithDuration(duration: number) {
    if (intervalRef.current) return
    setTimeLeft(duration)
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
    setTimeLeft(focusDuration)
    setCyclesCompleted(0)
  }

  function selectMode(nextMode: PomodoroMode) {
    stopInterval()
    setTimerState('idle')
    setMode(nextMode)
    setTimeLeft(nextMode === 'focus' ? focusDuration : breakDuration)
  }

  function setDurations(nextFocus: number, nextBreak: number) {
    stopInterval()
    setTimerState('idle')
    setFocusDuration(nextFocus)
    setBreakDuration(nextBreak)
    setTimeLeft(mode === 'focus' ? nextFocus : nextBreak)
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ focus: nextFocus, break: nextBreak, autoStart }),
    )
  }

  function setAutoStartPreference(nextValue: boolean) {
    setAutoStart(nextValue)
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        focus: focusDuration,
        break: breakDuration,
        autoStart: nextValue,
      }),
    )
  }

  useEffect(() => {
    if (timeLeft > 0) return

    stopInterval()
    setTimerState('idle')

    if (mode === 'focus') {
      setCyclesCompleted((prev) => prev + 1)

      registerPomodoroSession('FOCUS', focusDuration).catch((err) => {
        console.error('Erro ao registrar sessão:', err)
      })

      setMode('break')
      if (autoStart) {
        startWithDuration(breakDuration)
      } else {
        setTimeLeft(breakDuration)
      }
    } else {
      registerPomodoroSession('BREAK', breakDuration).catch((err) => {
        console.error('Erro ao registrar sessão:', err)
      })

      setMode('focus')
      if (autoStart) {
        startWithDuration(focusDuration)
      } else {
        setTimeLeft(focusDuration)
      }
    }
  }, [timeLeft, mode, focusDuration, breakDuration, autoStart])

  return {
    mode,
    timeLeft,
    timerState,
    isRunning: timerState === 'running',
    focusDuration,
    breakDuration,
    autoStart,
    cyclesCompleted,
    start,
    pause,
    reset,
    selectMode,
    setDurations,
    setAutoStartPreference,
  }
}
