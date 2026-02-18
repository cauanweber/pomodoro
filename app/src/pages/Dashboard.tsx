import { useEffect, useState, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Play, Pause, RotateCcw, Coffee, Focus, Settings } from 'lucide-react'

import { usePomodoro } from '../hooks/usePomodoro'
import { getPomodoroSessions } from '../services/pomodoroService'
import type { PomodoroSession } from '../types/pomodoro'
import { formatTime } from '../utils/time'
import { getMicrocopy } from '../utils/microcopy'

const BG_IDLE =
  'radial-gradient(circle at 14% 18%, rgba(16, 185, 129, 0.18) 0%, rgba(6, 78, 59, 0.1) 40%, transparent 65%), radial-gradient(circle at 86% 82%, rgba(255, 255, 255, 0.05) 0%, transparent 55%), linear-gradient(135deg, #0a1c1a 0%, #122428 55%, #243c40 100%)'
const FOCUS_GOAL_STORAGE_KEY = 'pomodoro:focusGoalSeconds'
const DEFAULT_FOCUS_GOAL_SECONDS = 4 * 3600
const FOCUS_GOAL_BASELINE_STORAGE_KEY = 'pomodoro:focusGoalBaseline'

function readStoredFocusGoal() {
  if (typeof window === 'undefined') return DEFAULT_FOCUS_GOAL_SECONDS
  const raw = localStorage.getItem(FOCUS_GOAL_STORAGE_KEY)
  if (!raw) return DEFAULT_FOCUS_GOAL_SECONDS
  const parsed = Number(raw)
  if (!Number.isFinite(parsed) || parsed < 60) return DEFAULT_FOCUS_GOAL_SECONDS
  return Math.round(parsed)
}

function readStoredGoalBaseline() {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(FOCUS_GOAL_BASELINE_STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as { date?: string; seconds?: number }
    if (
      parsed.date === new Date().toDateString() &&
      typeof parsed.seconds === 'number' &&
      Number.isFinite(parsed.seconds) &&
      parsed.seconds >= 0
    ) {
      return parsed.seconds
    }
    return null
  } catch {
    return null
  }
}

export function Dashboard() {
  const {
    mode,
    timeLeft,
    timeLeftMs,
    timerState,
    start,
    pause,
    reset,
    selectMode,
    focusDuration,
    breakDuration,
    setDurations,
    autoStart,
    setAutoStartPreference,
    sessionEventVersion,
  } = usePomodoro()

  const [sessions, setSessions] = useState<PomodoroSession[]>([])
  const [hasError, setHasError] = useState(false)

  const fetchSessions = useCallback(async () => {
    try {
      const data = await getPomodoroSessions()
      setSessions(data)
      setHasError(false)
    } catch {
      setHasError(true)
    }
  }, [])

  useEffect(() => {
    const runFetch = () => {
      if (document.hidden) return
      void fetchSessions()
    }

    const timeout = setTimeout(runFetch, 0)
    const interval = setInterval(runFetch, 60000)
    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [fetchSessions])

  useEffect(() => {
    if (document.hidden) return
    void fetchSessions()
  }, [sessionEventVersion, fetchSessions])

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [focusHours, setFocusHours] = useState(0)
  const [focusMinutes, setFocusMinutes] = useState(25)
  const [breakHours, setBreakHours] = useState(0)
  const [breakMinutes, setBreakMinutes] = useState(5)
  const [goalHours, setGoalHours] = useState(4)
  const [goalMinutes, setGoalMinutes] = useState(0)
  const [settingsError, setSettingsError] = useState<string | null>(null)
  const [settingsSaved, setSettingsSaved] = useState(false)
  const [pulseKey, setPulseKey] = useState(0)
  const [showPulse, setShowPulse] = useState(false)
  const [focusGoalSeconds, setFocusGoalSeconds] = useState(readStoredFocusGoal)
  const [focusGoalBaselineSeconds, setFocusGoalBaselineSeconds] = useState<number | null>(
    readStoredGoalBaseline,
  )
  const [isPageVisible, setIsPageVisible] = useState(
    typeof document === 'undefined' ? true : !document.hidden,
  )
  const [reduceMotion, setReduceMotion] = useState(false)
  const [isMobile, setIsMobile] = useState(
    typeof window === 'undefined'
      ? false
      : window.matchMedia('(max-width: 768px)').matches,
  )
  const [lowPowerMode, setLowPowerMode] = useState(false)

  const isRunning = timerState === 'running'
  const shouldAnimate = isRunning && isPageVisible && !reduceMotion

  useEffect(() => {
    const onVisibilityChange = () => {
      const visible = !document.hidden
      setIsPageVisible(visible)
      if (visible) {
        void fetchSessions()
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    return () =>
      document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [fetchSessions])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduceMotion(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)')
    const sync = () => setIsMobile(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number }
    const lowCpu = navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4
    const lowMemory = typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4
    setLowPowerMode(lowCpu || lowMemory)
  }, [])

  useEffect(() => {
    localStorage.setItem(FOCUS_GOAL_STORAGE_KEY, String(focusGoalSeconds))
  }, [focusGoalSeconds])

  const formatShort = useCallback((seconds: number) => {
    const totalMinutes = Math.max(1, Math.round(seconds / 60))
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    if (hours === 0) return `${minutes}min`
    if (minutes === 0) return `${hours}h`
    return `${hours}h ${minutes}min`
  }, [])

  const formatGoalClock = useCallback((seconds: number) => {
    const totalMinutes = Math.max(0, Math.ceil(seconds / 60))
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  }, [])

  const todayKey = new Date().toDateString()
  const focusCompletedSeconds = sessions
    .filter((session) => {
      if (session.type !== 'FOCUS') return false
      return new Date(session.completedAt).toDateString() === todayKey
    })
    .reduce((sum, session) => sum + session.duration, 0)
  const currentFocusElapsedSeconds =
    mode === 'focus' && timerState !== 'idle'
      ? Math.max(0, focusDuration - timeLeftMs / 1000)
      : 0
  const focusSpentRawSeconds = focusCompletedSeconds + currentFocusElapsedSeconds
  const focusGoalBaseline = focusGoalBaselineSeconds ?? focusCompletedSeconds
  const focusSpentSeconds = Math.max(0, focusSpentRawSeconds - focusGoalBaseline)
  const focusGoalRemainingSeconds = Math.max(0, focusGoalSeconds - focusSpentSeconds)
  const focusGoalProgress = Math.max(
    0,
    Math.min(1, focusSpentSeconds / Math.max(1, focusGoalSeconds)),
  )
  const currentModeDuration =
    (mode === 'focus' ? focusDuration : breakDuration) * 1000
  const timerProgress = Math.max(
    0,
    Math.min(1, timeLeftMs / Math.max(1, currentModeDuration)),
  )

  useEffect(() => {
    if (focusGoalBaselineSeconds === null) {
      const baseline = focusCompletedSeconds
      setFocusGoalBaselineSeconds(baseline)
      localStorage.setItem(
        FOCUS_GOAL_BASELINE_STORAGE_KEY,
        JSON.stringify({
          date: todayKey,
          seconds: baseline,
        }),
      )
      return
    }

    if (focusGoalBaselineSeconds > focusSpentRawSeconds) {
      const baseline = focusCompletedSeconds
      setFocusGoalBaselineSeconds(baseline)
      localStorage.setItem(
        FOCUS_GOAL_BASELINE_STORAGE_KEY,
        JSON.stringify({
          date: todayKey,
          seconds: baseline,
        }),
      )
    }
  }, [
    focusGoalBaselineSeconds,
    focusCompletedSeconds,
    focusSpentRawSeconds,
    todayKey,
  ])

  const resetFocusGoalProgress = () => {
    const baseline = focusSpentRawSeconds
    setFocusGoalBaselineSeconds(baseline)
    localStorage.setItem(
      FOCUS_GOAL_BASELINE_STORAGE_KEY,
      JSON.stringify({
        date: todayKey,
        seconds: baseline,
      }),
    )
  }

  const getButtonText = () => {
    if (mode === 'focus') {
      return timerState === 'running' ? 'Pausar foco' : 'Iniciar foco'
    }
    return timerState === 'running' ? 'Pausar pausa' : 'Iniciar pausa'
  }

  const triggerPulse = () => {
    setPulseKey((prev) => prev + 1)
    setShowPulse(true)
  }

  const handleStartPause = () => {
    if (!lowPowerMode) {
      triggerPulse()
    }
    if (isRunning) {
      pause()
    } else {
      start()
    }
  }

  const applyDurations = () => {
    const focusTotal = Math.max(1, focusHours * 3600 + focusMinutes * 60)
    const breakTotal = Math.max(1, breakHours * 3600 + breakMinutes * 60)
    const goalTotal = Math.max(0, goalHours * 3600 + goalMinutes * 60)

    if (focusTotal < 60 || breakTotal < 60 || goalTotal < 60) {
      setSettingsError('O mínimo é 1 minuto para foco, pausa e meta.')
      return
    }

    setSettingsError(null)
    setDurations(focusTotal, breakTotal)
    setFocusGoalSeconds(goalTotal)
    setSettingsOpen(false)
    setSettingsSaved(true)
  }

  const presets = [
    { label: 'Foco 25 / Pausa 5', focus: 25 * 60, break: 5 * 60 },
    { label: 'Foco 50 / Pausa 10', focus: 50 * 60, break: 10 * 60 },
    { label: 'Foco 90 / Pausa 15', focus: 90 * 60, break: 15 * 60 },
  ]

  const openSettings = () => {
    setFocusHours(Math.floor(focusDuration / 3600))
    setFocusMinutes(Math.floor((focusDuration % 3600) / 60))
    setBreakHours(Math.floor(breakDuration / 3600))
    setBreakMinutes(Math.floor((breakDuration % 3600) / 60))
    setGoalHours(Math.floor(focusGoalSeconds / 3600))
    setGoalMinutes(Math.floor((focusGoalSeconds % 3600) / 60))
    setSettingsOpen(true)
  }


  useEffect(() => {
    if (!settingsOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSettingsOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [settingsOpen])

  useEffect(() => {
    if (!settingsSaved) return
    const timeout = setTimeout(() => setSettingsSaved(false), 2000)
    return () => clearTimeout(timeout)
  }, [settingsSaved])

  return (
    <div
      className="dashboard-scope relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6"
      style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}
    >
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: BG_IDLE,
        }}
      />

      <div
        className="absolute inset-0 -z-10 opacity-[0.015] hidden md:block"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")',
        }}
      />

      <div className="relative z-10 w-full max-w-xl flex flex-col items-center gap-6 sm:gap-8">
        <div
          className="w-full rounded-3xl p-4 sm:p-5 backdrop-blur-none sm:backdrop-blur-sm history-card-in"
          style={{
            background: 'rgba(255, 255, 255, 0.035)',
            border: '1px solid rgba(255, 255, 255, 0.09)',
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm sm:text-base font-medium text-gray-200/85">Meta de foco</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-emerald-300/90">
                {formatGoalClock(focusGoalRemainingSeconds)} restante
              </span>
              <button
                type="button"
                onClick={resetFocusGoalProgress}
                className="inline-flex items-center justify-center w-6 h-6 rounded-full border"
                aria-label="Resetar meta de foco"
                style={{
                  color: 'rgba(255, 255, 255, 0.75)',
                  borderColor: 'rgba(255, 255, 255, 0.16)',
                  background: 'rgba(255, 255, 255, 0.04)',
                }}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="mt-2 h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className="goal-progress-fill h-full rounded-full"
              style={{
                width: `${focusGoalProgress * 100}%`,
                background:
                  'linear-gradient(90deg, rgba(16, 185, 129, 0.9) 0%, rgba(52, 211, 153, 0.9) 100%)',
              }}
            />
          </div>
        </div>

        <div
          className="absolute -inset-16 rounded-[48px] pointer-events-none"
          style={{
            filter: 'blur(52px)',
            opacity: shouldAnimate ? (isMobile ? 0.16 : 0.25) : 0.1,
            background:
              mode === 'focus'
                ? 'radial-gradient(circle, rgba(16, 185, 129, 0.34) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(20, 184, 166, 0.3) 0%, transparent 70%)',
          }}
        />

        <div
          className="relative w-full rounded-3xl p-8 sm:p-10 lg:p-12 backdrop-blur-none sm:backdrop-blur-sm overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: isRunning
              ? mode === 'focus'
                ? '0 20px 60px -15px rgba(16, 185, 129, 0.42), 0 10px 30px -10px rgba(6, 78, 59, 0.32)'
                : '0 20px 60px -15px rgba(20, 184, 166, 0.35), 0 10px 30px -10px rgba(19, 78, 74, 0.24)'
              : '0 10px 40px -10px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div className="absolute left-0 right-0 bottom-0 h-[3px] bg-white/10 pointer-events-none overflow-hidden">
            <div
              className={`timer-progress-fill h-full ${
                mode === 'focus'
                  ? 'timer-progress-focus'
                  : 'timer-progress-break'
              }`}
              style={{
                transform: `scaleX(${timerProgress})`,
                opacity: timerState === 'paused' ? 0.45 : 0.95,
              }}
            />
          </div>
          <AnimatePresence>
            {showPulse && (
              <motion.div
                key={pulseKey}
                className="absolute inset-0 rounded-3xl pointer-events-none"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: [0, 0.25, 0], scale: [1, 1.01, 1] }}
                exit={{ opacity: 0, scale: 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                style={{
                  boxShadow:
                    mode === 'focus'
                      ? '0 0 30px rgba(16, 185, 129, 0.35)'
                      : '0 0 30px rgba(20, 184, 166, 0.3)',
                }}
                onAnimationComplete={() => setShowPulse(false)}
              />
            )}
          </AnimatePresence>
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full pointer-events-none"
            style={{
              opacity: shouldAnimate ? (isMobile ? 0.18 : 0.26) : 0.12,
              background:
                mode === 'focus'
                  ? 'radial-gradient(circle, rgba(16, 185, 129, 0.28) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(20, 184, 166, 0.24) 0%, transparent 70%)',
            }}
          />

          <div
            key={mode}
            className="mode-fade-in relative z-10 flex flex-col items-center gap-5 sm:gap-6"
          >
            <div
              className={`text-6xl sm:text-7xl lg:text-8xl font-mono tracking-tight ${shouldAnimate && timeLeft <= 10 ? 'timer-pop' : ''}`}
              style={{
                color:
                  mode === 'focus'
                    ? 'rgba(16, 185, 129, 0.95)'
                    : 'rgba(20, 184, 166, 0.9)',
                textShadow: isRunning
                  ? mode === 'focus'
                    ? '0 0 16px rgba(16, 185, 129, 0.28)'
                    : '0 0 16px rgba(20, 184, 166, 0.22)'
                  : 'none',
              }}
            >
              {formatTime(timeLeft)}
            </div>

            <p
              className="mode-fade-in text-sm text-gray-300/70 text-center max-w-sm"
              key={getMicrocopy(mode, timerState)}
            >
              {getMicrocopy(mode, timerState)}
            </p>

            <div className="flex items-center gap-3 sm:gap-4 mt-4">
              <button
                onClick={handleStartPause}
                className={`relative px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-medium overflow-hidden group transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] timer-main-btn ${
                  mode === 'focus' ? 'timer-main-btn-focus' : 'timer-main-btn-break'
                }`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {isRunning ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  {getButtonText()}
                </span>

                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ background: 'rgba(255, 255, 255, 0.06)' }}
                />
              </button>

              <button
                onClick={reset}
                className="px-3 py-3 sm:px-4 sm:py-4 rounded-2xl backdrop-blur-none sm:backdrop-blur-sm transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: 'rgba(255, 255, 255, 0.5)',
                }}
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={openSettings}
                className="px-3 py-3 sm:px-4 sm:py-4 rounded-2xl backdrop-blur-none sm:backdrop-blur-sm transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: 'rgba(255, 255, 255, 0.5)',
                }}
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 mt-3 text-[11px] sm:text-xs">
              <button
                type="button"
                onClick={() => selectMode('focus')}
                className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full border transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background:
                    mode === 'focus'
                      ? 'rgba(16, 185, 129, 0.12)'
                      : 'rgba(255, 255, 255, 0.02)',
                  borderColor:
                    mode === 'focus'
                      ? 'rgba(16, 185, 129, 0.4)'
                      : 'rgba(255, 255, 255, 0.08)',
                  color:
                    mode === 'focus'
                      ? 'rgba(16, 185, 129, 0.9)'
                      : 'rgba(255, 255, 255, 0.6)',
                }}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Focus className="w-3.5 h-3.5" />
                  Foco {formatShort(focusDuration)}
                </span>
              </button>
              <button
                type="button"
                onClick={() => selectMode('break')}
                className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full border transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background:
                    mode === 'break'
                      ? 'rgba(20, 184, 166, 0.12)'
                      : 'rgba(255, 255, 255, 0.02)',
                  borderColor:
                    mode === 'break'
                      ? 'rgba(20, 184, 166, 0.4)'
                      : 'rgba(255, 255, 255, 0.08)',
                  color:
                    mode === 'break'
                      ? 'rgba(20, 184, 166, 0.9)'
                      : 'rgba(255, 255, 255, 0.6)',
                }}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Coffee className="w-3.5 h-3.5" />
                  Pausa {formatShort(breakDuration)}
                </span>
              </button>
            </div>
          </div>

        </div>

        <HistoryCard
          hasError={hasError}
          sessions={sessions}
          formatShort={formatShort}
          isMobile={isMobile}
        />
      </div>

      <style>{`
        .dashboard-scope, 
        .dashboard-scope * {
          font-family: ui-sans-serif, system-ui, sans-serif;
          box-sizing: border-box;
        }

        .dashboard-scope p,
        .dashboard-scope h3 {
          margin: 0;
        }

        .dashboard-scope button,
        .dashboard-scope input,
        .dashboard-scope textarea {
          font: inherit;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .dashboard-scope::-webkit-scrollbar,
        body::-webkit-scrollbar {
          width: 6px;
        }

        .dashboard-scope::-webkit-scrollbar-track,
        body::-webkit-scrollbar-track {
          background: rgba(10, 28, 26, 0.6);
        }

        .dashboard-scope::-webkit-scrollbar-thumb,
        body::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.12);
          border-radius: 10px;
          border: 2px solid rgba(10, 28, 26, 0.6);
        }

        .dashboard-scope::-webkit-scrollbar-thumb:hover,
        body::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .dashboard-scope {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05);
        }

        .timer-progress-fill {
          transform-origin: left center;
          will-change: transform;
          transition: transform 1s linear, opacity 0.2s ease;
        }

        .timer-progress-focus {
          background: linear-gradient(
            90deg,
            rgba(16, 185, 129, 0.95),
            rgba(52, 211, 153, 0.95)
          );
        }

        .timer-progress-break {
          background: linear-gradient(
            90deg,
            rgba(20, 184, 166, 0.95),
            rgba(45, 212, 191, 0.95)
          );
        }

        .timer-main-btn {
          border-width: 1px;
          border-style: solid;
        }

        .timer-main-btn-focus {
          background: linear-gradient(
            135deg,
            rgba(16, 185, 129, 0.15) 0%,
            rgba(6, 78, 59, 0.2) 100%
          );
          border-color: rgba(16, 185, 129, 0.3);
          color: #10b981;
        }

        .timer-main-btn-break {
          background: linear-gradient(
            135deg,
            rgba(20, 184, 166, 0.15) 0%,
            rgba(19, 78, 74, 0.2) 100%
          );
          border-color: rgba(20, 184, 166, 0.3);
          color: #14b8a6;
        }

        .goal-progress-fill {
          transition: width 0.35s ease-out;
        }

        .mode-fade-in {
          animation: modeFadeIn 220ms ease-out both;
        }

        .timer-pop {
          animation: timerPop 1s ease-in-out infinite;
        }

        @keyframes modeFadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes timerPop {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }

        .switch {
          position: relative;
          display: inline-flex;
          align-items: center;
          width: 44px;
          height: 24px;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .switch-track {
          position: absolute;
          inset: 0;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          transition: all 0.2s ease;
        }

        .switch-track::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 3px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.8);
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
        }

        .switch input:checked + .switch-track {
          background: rgba(16, 185, 129, 0.2);
          border-color: rgba(16, 185, 129, 0.45);
        }

        .switch input:checked + .switch-track::after {
          left: 24px;
          background: rgba(16, 185, 129, 0.95);
        }

        .history-fade-in {
          animation: historyFadeIn 180ms ease-out both;
        }

        .history-card-in {
          animation: historyCardIn 200ms ease-out both;
        }

        @keyframes historyFadeIn {
          from {
            opacity: 0.75;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes historyCardIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-root-in {
          animation: modalRootIn 140ms ease-out both;
        }

        .modal-panel-in {
          animation: modalPanelIn 180ms ease-out both;
        }

        .toast-in {
          animation: toastIn 180ms ease-out both;
        }

        @keyframes modalRootIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalPanelIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes toastIn {
          from {
            opacity: 0;
            transform: translate(-50%, 8px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .dashboard-scope * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-root-in">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSettingsOpen(false)}
          />

          <div
            className="relative w-full max-w-lg rounded-3xl p-6 sm:p-8 backdrop-blur-none sm:backdrop-blur-sm max-h-[85vh] overflow-y-auto modal-panel-in"
            style={{
              background: 'rgba(10, 24, 26, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
              <div className="flex flex-col gap-4 mb-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-200/90">
                      Configurar Pomodoro
                    </h3>
                    <p className="text-xs text-gray-300/60 mt-1">
                      Ajuste foco e pausa do jeito que funciona para você.
                    </p>
                  </div>
                  <div className="text-left sm:text-right text-xs text-gray-300/70">
                    <p>
                      Foco:{' '}
                      {formatShort(focusHours * 3600 + focusMinutes * 60)}
                    </p>
                    <p>
                      Pausa:{' '}
                      {formatShort(breakHours * 3600 + breakMinutes * 60)}
                    </p>
                    <p>
                      Meta:{' '}
                      {formatShort(goalHours * 3600 + goalMinutes * 60)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gray-300/50 mb-2">
                    Presets
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {presets.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setFocusHours(Math.floor(preset.focus / 3600))
                          setFocusMinutes(
                            Math.floor((preset.focus % 3600) / 60),
                          )
                          setBreakHours(Math.floor(preset.break / 3600))
                          setBreakMinutes(
                            Math.floor((preset.break % 3600) / 60),
                          )
                        }}
                        className="w-full px-4 py-3 sm:px-3 sm:py-2 rounded-2xl text-xs sm:text-xs border text-center transition-all duration-150 hover:scale-[1.01] active:scale-[0.99]"
                        style={{
                          background:
                            preset.focus === focusHours * 3600 + focusMinutes * 60 &&
                            preset.break === breakHours * 3600 + breakMinutes * 60
                              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(6, 78, 59, 0.24) 100%)'
                              : 'rgba(255, 255, 255, 0.03)',
                          borderColor:
                            preset.focus === focusHours * 3600 + focusMinutes * 60 &&
                            preset.break === breakHours * 3600 + breakMinutes * 60
                              ? 'rgba(16, 185, 129, 0.4)'
                              : 'rgba(255, 255, 255, 0.1)',
                          color:
                            preset.focus === focusHours * 3600 + focusMinutes * 60 &&
                            preset.break === breakHours * 3600 + breakMinutes * 60
                              ? 'rgba(16, 185, 129, 0.95)'
                              : 'rgba(255, 255, 255, 0.75)',
                        }}
                      >
                        <span className="flex flex-col items-center gap-1.5 leading-tight">
                          <span className="inline-flex items-center gap-1.5">
                            <Focus className="w-3.5 h-3.5" />
                            {preset.label.split('/')[0].trim()}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-300/70">
                            <Coffee className="w-3.5 h-3.5" />
                            {preset.label.split('/')[1].trim()}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <div
                  className="rounded-2xl p-4 border"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-gray-200/80">Tempo de foco</p>
                    <span className="text-xs text-emerald-300/90">
                      {formatShort(focusHours * 3600 + focusMinutes * 60)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="text-xs text-gray-300/70">
                      Horas
                      <input
                        type="number"
                        min={0}
                        max={12}
                        step={1}
                        value={focusHours}
                        onChange={(e) => setFocusHours(Number(e.target.value))}
                        className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-gray-100"
                      />
                    </label>
                    <label className="text-xs text-gray-300/70">
                      Minutos
                      <input
                        type="number"
                        min={0}
                        max={59}
                        step={5}
                        value={focusMinutes}
                        onChange={(e) =>
                          setFocusMinutes(Number(e.target.value))
                        }
                        className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-gray-100"
                      />
                    </label>
                  </div>
                </div>

                <div
                  className="rounded-2xl p-4 border"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-gray-200/80">Tempo de pausa</p>
                    <span className="text-xs text-teal-300/90">
                      {formatShort(breakHours * 3600 + breakMinutes * 60)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="text-xs text-gray-300/70">
                      Horas
                      <input
                        type="number"
                        min={0}
                        max={12}
                        step={1}
                        value={breakHours}
                        onChange={(e) => setBreakHours(Number(e.target.value))}
                        className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-gray-100"
                      />
                    </label>
                    <label className="text-xs text-gray-300/70">
                      Minutos
                      <input
                        type="number"
                        min={0}
                        max={59}
                        step={5}
                        value={breakMinutes}
                        onChange={(e) =>
                          setBreakMinutes(Number(e.target.value))
                        }
                        className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-gray-100"
                      />
                    </label>
                  </div>
                </div>

                <div
                  className="rounded-2xl p-4 border"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-gray-200/80">Meta de foco diária</p>
                    <span className="text-xs text-emerald-300/90">
                      {formatShort(goalHours * 3600 + goalMinutes * 60)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="text-xs text-gray-300/70">
                      Horas
                      <input
                        type="number"
                        min={0}
                        max={24}
                        step={1}
                        value={goalHours}
                        onChange={(e) => setGoalHours(Number(e.target.value))}
                        className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-gray-100"
                      />
                    </label>
                    <label className="text-xs text-gray-300/70">
                      Minutos
                      <input
                        type="number"
                        min={0}
                        max={59}
                        step={5}
                        value={goalMinutes}
                        onChange={(e) => setGoalMinutes(Number(e.target.value))}
                        className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-gray-100"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <label className="mt-4 flex items-center justify-between gap-3 text-sm text-gray-200/80">
                <span>Iniciar automaticamente o próximo ciclo</span>
                <span className="switch">
                  <input
                    type="checkbox"
                    checked={autoStart}
                    onChange={(e) => setAutoStartPreference(e.target.checked)}
                  />
                  <span className="switch-track" />
                </span>
              </label>

              {settingsError && (
                <p className="mt-3 text-xs text-rose-400/90">
                  {settingsError}
                </p>
              )}

              <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSettingsOpen(false)}
                  className="px-4 py-2 rounded-xl border text-sm w-full sm:w-auto"
                  style={{
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.7)',
                    background: 'rgba(255, 255, 255, 0.02)',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={applyDurations}
                  className="px-4 py-2 rounded-xl text-sm font-medium w-full sm:w-auto"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 78, 59, 0.3) 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    color: '#10b981',
                  }}
                >
                  Aplicar
                </button>
              </div>
          </div>
        </div>
      )}

      {settingsSaved && (
        <div
          className="fixed left-1/2 bottom-6 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-xs toast-in"
          style={{
            background: 'rgba(16, 185, 129, 0.2)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: 'rgba(16, 185, 129, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          Configurações salvas
        </div>
      )}
    </div>
  )
}

const HistoryCard = memo(function HistoryCard({
  hasError,
  sessions,
  formatShort,
  isMobile,
}: {
  hasError: boolean
  sessions: PomodoroSession[]
  formatShort: (seconds: number) => string
  isMobile: boolean
}) {
  const MOBILE_HISTORY_LIMIT = 10
  const [showAllMobileHistory, setShowAllMobileHistory] = useState(false)

  useEffect(() => {
    if (!isMobile) {
      setShowAllMobileHistory(true)
      return
    }
    setShowAllMobileHistory(false)
  }, [isMobile])

  if (hasError) {
    return (
      <p className="text-sm text-red-500 text-center">
        Erro ao carregar histórico
      </p>
    )
  }

  return (
    <div
      className="w-full rounded-3xl p-6 sm:p-8 backdrop-blur-none sm:backdrop-blur-sm history-card-in"
      style={{
        background: 'rgba(255, 255, 255, 0.035)',
        border: '1px solid rgba(255, 255, 255, 0.09)',
      }}
    >
      <h3 className="text-lg font-medium text-gray-200/80 mb-4">
        Histórico recente
      </h3>

      <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
        {sessions.length === 0 ? (
          <div className="text-center py-12 history-fade-in">
            <p className="text-gray-400/60 text-sm leading-relaxed">
              Seu histórico está vazio.
              <br />
              Comece uma sessão para acompanhar seu progresso.
            </p>
          </div>
        ) : (
          <div className="history-fade-in">
            {(isMobile && !showAllMobileHistory
              ? sessions.slice(0, MOBILE_HISTORY_LIMIT)
              : sessions
            ).map((session) => {
              const isFocus = session.type === 'FOCUS'

              return (
                <div
                  key={session.id}
                  className="flex items-center gap-4 p-4 rounded-xl mb-2"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                  }}
                >
                  <div
                    className="p-2 rounded-lg"
                    style={{
                      background: isFocus
                        ? 'rgba(16, 185, 129, 0.1)'
                        : 'rgba(20, 184, 166, 0.1)',
                    }}
                  >
                    {isFocus ? (
                      <Focus className="w-4 h-4" style={{ color: '#10b981' }} />
                    ) : (
                      <Coffee
                        className="w-4 h-4"
                        style={{ color: '#14b8a6' }}
                      />
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-200/90">
                      {isFocus ? 'Sessão de foco' : 'Pausa'}
                    </p>
                    <p className="text-xs text-gray-400/60">
                      {formatShort(session.duration)}
                    </p>
                  </div>

                  <div className="text-right text-xs text-gray-400/50">
                    <p>
                      {new Date(session.completedAt).toLocaleDateString(
                        'pt-BR',
                        { day: '2-digit', month: '2-digit' },
                      )}
                    </p>
                    <p>
                      {new Date(session.completedAt).toLocaleTimeString(
                        'pt-BR',
                        {
                          hour: '2-digit',
                          minute: '2-digit',
                        },
                      )}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {isMobile && sessions.length > MOBILE_HISTORY_LIMIT && (
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAllMobileHistory((prev) => !prev)}
            className="px-3 py-1.5 rounded-full text-xs border transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderColor: 'rgba(255, 255, 255, 0.12)',
              color: 'rgba(255, 255, 255, 0.78)',
            }}
          >
            {showAllMobileHistory ? 'Ver menos' : 'Ver mais'}
          </button>
        </div>
      )}
    </div>
  )
})
