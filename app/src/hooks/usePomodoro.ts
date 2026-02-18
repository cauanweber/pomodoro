import { useRef, useState } from 'react'
import { registerPomodoroSession } from '../services/pomodoroService'

type PomodoroMode = 'focus' | 'break'
type TimerState = 'idle' | 'running' | 'paused'

const DEFAULT_FOCUS_TIME = 25 * 60
const DEFAULT_BREAK_TIME = 5 * 60
const STORAGE_KEY = 'pomodoro:settings'
const BEEP_PEAK_GAIN = 0.45

type StoredSettings = {
  focus?: number
  break?: number
  autoStart?: boolean
  mode?: PomodoroMode
}

function readStoredSettings(): StoredSettings | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return null

  try {
    return JSON.parse(stored) as StoredSettings
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function usePomodoro() {
  const [initialSettings] = useState(() => {
    const stored = readStoredSettings()
    const focusValue =
      stored?.focus && stored.focus > 0 ? stored.focus : DEFAULT_FOCUS_TIME
    const breakValue =
      stored?.break && stored.break > 0 ? stored.break : DEFAULT_BREAK_TIME
    const modeValue =
      stored?.mode === 'focus' || stored?.mode === 'break'
        ? stored.mode
        : 'focus'

    return {
      focus: focusValue,
      break: breakValue,
      mode: modeValue,
      autoStart: typeof stored?.autoStart === 'boolean' ? stored.autoStart : true,
    }
  })

  const [mode, setMode] = useState<PomodoroMode>(initialSettings.mode)
  const [focusDuration, setFocusDuration] = useState(initialSettings.focus)
  const [breakDuration, setBreakDuration] = useState(initialSettings.break)
  const [timeLeft, setTimeLeft] = useState(
    initialSettings.mode === 'focus'
      ? initialSettings.focus
      : initialSettings.break,
  )
  const [timeLeftMs, setTimeLeftMs] = useState(
    (initialSettings.mode === 'focus'
      ? initialSettings.focus
      : initialSettings.break) * 1000,
  )
  const [autoStart, setAutoStart] = useState(initialSettings.autoStart)
  const [timerState, setTimerState] = useState<TimerState>('idle')
  const [cyclesCompleted, setCyclesCompleted] = useState(0)

  const intervalRef = useRef<number | null>(null)
  const endTimeRef = useRef<number | null>(null)
  const lastSyncedSecondRef = useRef<number>(
    initialSettings.mode === 'focus'
      ? initialSettings.focus
      : initialSettings.break,
  )
  const modeRef = useRef<PomodoroMode>(initialSettings.mode)
  const focusDurationRef = useRef(initialSettings.focus)
  const breakDurationRef = useRef(initialSettings.break)
  const autoStartRef = useRef(initialSettings.autoStart)

  function stopInterval() {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    endTimeRef.current = null
  }

  function syncTick(clampedMs: number) {
    const nextSecond = Math.max(0, Math.ceil(clampedMs / 1000))
    if (nextSecond === lastSyncedSecondRef.current) return
    lastSyncedSecondRef.current = nextSecond
    setTimeLeftMs(clampedMs)
    setTimeLeft(nextSecond)
  }

  function persistSettings(next: {
    focus?: number
    break?: number
    autoStart?: boolean
    mode?: PomodoroMode
  }) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        focus: next.focus ?? focusDuration,
        break: next.break ?? breakDuration,
        autoStart: next.autoStart ?? autoStart,
        mode: next.mode ?? mode,
      }),
    )
  }

  function playBeep() {
    try {
      const AudioCtx =
        window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const gain = ctx.createGain()
      const now = ctx.currentTime
      const duration = 1.0

      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      osc1.type = 'sine'
      osc2.type = 'sine'
      osc1.frequency.setValueAtTime(528, now)
      osc2.frequency.setValueAtTime(660, now)
      osc2.detune.setValueAtTime(-6, now)

      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(BEEP_PEAK_GAIN, now + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(ctx.destination)

      osc1.start(now)
      osc2.start(now)
      osc1.stop(now + duration)
      osc2.stop(now + duration)
      osc2.onended = () => ctx.close()
    } catch {
      // ignore audio errors
    }
  }

  function start() {
    if (timerState === 'running') return // não cria múltiplos intervalos

    const wasPaused = timerState === 'paused'
    setTimerState('running')
    if (!wasPaused) {
      playBeep()
    }
    // eslint-disable-next-line react-hooks/purity
    endTimeRef.current = Date.now() + timeLeft * 1000
    intervalRef.current = window.setInterval(() => {
      if (!endTimeRef.current) return
      const remainingMs = endTimeRef.current - Date.now()
      const clampedMs = Math.max(0, remainingMs)
      syncTick(clampedMs)
      if (clampedMs <= 0) {
        handleCycleEnd()
      }
    }, 100)
  }

  function startWithDuration(duration: number) {
    if (intervalRef.current) return
    setTimeLeft(duration)
    setTimeLeftMs(duration * 1000)
    lastSyncedSecondRef.current = duration
    setTimerState('running')
    // eslint-disable-next-line react-hooks/purity
    endTimeRef.current = Date.now() + duration * 1000
    intervalRef.current = window.setInterval(() => {
      if (!endTimeRef.current) return
      const remainingMs = endTimeRef.current - Date.now()
      const clampedMs = Math.max(0, remainingMs)
      syncTick(clampedMs)
      if (clampedMs <= 0) {
        handleCycleEnd()
      }
    }, 100)
  }

  function pause() {
    if (timerState !== 'running') return
    setTimerState('paused')
    stopInterval()
  }

  function reset() {
    stopInterval()
    setTimerState('idle')
    const duration =
      modeRef.current === 'focus'
        ? focusDurationRef.current
        : breakDurationRef.current
    setTimeLeft(duration)
    setTimeLeftMs(duration * 1000)
    lastSyncedSecondRef.current = duration
    setCyclesCompleted(0)
  }

  function selectMode(nextMode: PomodoroMode) {
    stopInterval()
    setTimerState('idle')
    modeRef.current = nextMode
    setMode(nextMode)
    const duration =
      nextMode === 'focus' ? focusDurationRef.current : breakDurationRef.current
    setTimeLeft(duration)
    setTimeLeftMs(
      duration * 1000,
    )
    lastSyncedSecondRef.current = duration
    persistSettings({ mode: nextMode })
  }

  function setDurations(nextFocus: number, nextBreak: number) {
    stopInterval()
    setTimerState('idle')
    focusDurationRef.current = nextFocus
    breakDurationRef.current = nextBreak
    setFocusDuration(nextFocus)
    setBreakDuration(nextBreak)
    const duration = modeRef.current === 'focus' ? nextFocus : nextBreak
    setTimeLeft(duration)
    setTimeLeftMs(duration * 1000)
    lastSyncedSecondRef.current = duration
    persistSettings({ focus: nextFocus, break: nextBreak })
  }

  function setAutoStartPreference(nextValue: boolean) {
    autoStartRef.current = nextValue
    setAutoStart(nextValue)
    persistSettings({ autoStart: nextValue })
  }

  function handleCycleEnd() {
    stopInterval()
    setTimerState('idle')
    const currentMode = modeRef.current

    if (currentMode === 'focus') {
      setCyclesCompleted((prev) => prev + 1)
      registerPomodoroSession('FOCUS', focusDurationRef.current).catch((err) => {
        console.error('Erro ao registrar sessão:', err)
      })
      playBeep()
      modeRef.current = 'break'
      setMode('break')
      persistSettings({ mode: 'break' })
      if (autoStartRef.current) {
        startWithDuration(breakDurationRef.current)
      } else {
        setTimeLeft(breakDurationRef.current)
        setTimeLeftMs(breakDurationRef.current * 1000)
        lastSyncedSecondRef.current = breakDurationRef.current
      }
    } else {
      registerPomodoroSession('BREAK', breakDurationRef.current).catch((err) => {
        console.error('Erro ao registrar sessão:', err)
      })
      playBeep()
      modeRef.current = 'focus'
      setMode('focus')
      persistSettings({ mode: 'focus' })
      if (autoStartRef.current) {
        startWithDuration(focusDurationRef.current)
      } else {
        setTimeLeft(focusDurationRef.current)
        setTimeLeftMs(focusDurationRef.current * 1000)
        lastSyncedSecondRef.current = focusDurationRef.current
      }
    }
  }

  return {
    mode,
    timeLeft,
    timeLeftMs,
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
