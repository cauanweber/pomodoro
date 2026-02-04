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
      void fetchSessions()
    }

    const timeout = setTimeout(runFetch, 0)
    const interval = setInterval(runFetch, 5000)
    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [fetchSessions])

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [focusHours, setFocusHours] = useState(0)
  const [focusMinutes, setFocusMinutes] = useState(25)
  const [breakHours, setBreakHours] = useState(0)
  const [breakMinutes, setBreakMinutes] = useState(5)
  const [settingsError, setSettingsError] = useState<string | null>(null)
  const [settingsSaved, setSettingsSaved] = useState(false)
  const [pulseKey, setPulseKey] = useState(0)
  const [showPulse, setShowPulse] = useState(false)

  const isRunning = timerState === 'running'

  const formatShort = useCallback((seconds: number) => {
    const totalMinutes = Math.max(1, Math.round(seconds / 60))
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    if (hours === 0) return `${minutes}min`
    if (minutes === 0) return `${hours}h`
    return `${hours}h ${minutes}min`
  }, [])

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
    triggerPulse()
    if (isRunning) {
      pause()
    } else {
      start()
    }
  }

  const applyDurations = () => {
    const focusTotal = Math.max(1, focusHours * 3600 + focusMinutes * 60)
    const breakTotal = Math.max(1, breakHours * 3600 + breakMinutes * 60)
    if (focusTotal < 60 || breakTotal < 60) {
      setSettingsError('O mínimo é 1 minuto para foco e pausa.')
      return
    }

    setSettingsError(null)
    setDurations(focusTotal, breakTotal)
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
      <motion.div
        className="absolute inset-0 -z-10"
        animate={{
          background: isRunning
            ? [
                'radial-gradient(circle at 12% 12%, rgba(16, 185, 129, 0.38) 0%, rgba(6, 78, 59, 0.18) 42%, transparent 70%), radial-gradient(circle at 88% 12%, rgba(255, 255, 255, 0.1) 0%, transparent 60%), linear-gradient(135deg, #0a1c1a 0%, #122428 55%, #243c40 100%)',
                'radial-gradient(circle at 88% 12%, rgba(16, 185, 129, 0.38) 0%, rgba(6, 78, 59, 0.18) 42%, transparent 70%), radial-gradient(circle at 88% 88%, rgba(255, 255, 255, 0.1) 0%, transparent 60%), linear-gradient(135deg, #0a1c1a 0%, #122428 55%, #243c40 100%)',
                'radial-gradient(circle at 12% 88%, rgba(16, 185, 129, 0.38) 0%, rgba(6, 78, 59, 0.18) 42%, transparent 70%), radial-gradient(circle at 88% 88%, rgba(255, 255, 255, 0.1) 0%, transparent 60%), linear-gradient(135deg, #0a1c1a 0%, #122428 55%, #243c40 100%)',
                'radial-gradient(circle at 88% 88%, rgba(16, 185, 129, 0.38) 0%, rgba(6, 78, 59, 0.18) 42%, transparent 70%), radial-gradient(circle at 12% 88%, rgba(255, 255, 255, 0.1) 0%, transparent 60%), linear-gradient(135deg, #0a1c1a 0%, #122428 55%, #243c40 100%)',
              ]
            : BG_IDLE,
        }}
        transition={
          isRunning
            ? {
                duration: 28,
                repeat: Infinity,
                ease: 'easeInOut',
                repeatType: 'mirror',
              }
            : { duration: 0 }
        }
      />

      <div
        className="absolute inset-0 -z-10 opacity-[0.015]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")',
        }}
      />

      <AnimatePresence>
        {isRunning && (
          <motion.div
            className="absolute inset-0 -z-10 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.12, 0.22, 0.12, 0] }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
              times: [0, 0.35, 0.5, 0.65, 1],
            }}
            style={{
              background:
                mode === 'focus'
                  ? 'radial-gradient(circle at 18% 45%, rgba(16, 185, 129, 0.35) 0%, rgba(16, 185, 129, 0.15) 35%, transparent 65%)'
                  : 'radial-gradient(circle at 18% 45%, rgba(20, 184, 166, 0.3) 0%, rgba(20, 184, 166, 0.12) 35%, transparent 65%)',
            }}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 w-full max-w-xl flex flex-col items-center gap-6 sm:gap-8">
        <AnimatePresence>
          {isRunning && (
            <motion.div
              className="absolute -inset-16 rounded-[48px] pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.16, 0.28, 0.4, 0.28, 0.16] }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut',
                times: [0, 0.3, 0.5, 0.7, 1],
              }}
              style={{
                filter: 'blur(70px)',
                background:
                  mode === 'focus'
                    ? 'radial-gradient(circle, rgba(16, 185, 129, 0.45) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(20, 184, 166, 0.4) 0%, transparent 70%)',
              }}
            />
          )}
        </AnimatePresence>

        <motion.div
          className="relative w-full rounded-3xl p-8 sm:p-10 lg:p-12 backdrop-blur-xl"
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
          animate={{
            boxShadow: isRunning
              ? mode === 'focus'
                ? [
                    '0 20px 60px -15px rgba(16, 185, 129, 0.4), 0 10px 30px -10px rgba(6, 78, 59, 0.3)',
                    '0 25px 70px -15px rgba(16, 185, 129, 0.5), 0 15px 35px -10px rgba(6, 78, 59, 0.4)',
                    '0 20px 60px -15px rgba(16, 185, 129, 0.4), 0 10px 30px -10px rgba(6, 78, 59, 0.3)',
                  ]
                : [
                    '0 20px 60px -15px rgba(20, 184, 166, 0.3), 0 10px 30px -10px rgba(19, 78, 74, 0.2)',
                    '0 25px 70px -15px rgba(20, 184, 166, 0.4), 0 15px 35px -10px rgba(19, 78, 74, 0.3)',
                    '0 20px 60px -15px rgba(20, 184, 166, 0.3), 0 10px 30px -10px rgba(19, 78, 74, 0.2)',
                  ]
              : '0 10px 40px -10px rgba(0, 0, 0, 0.3)',
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <motion.div
            className="absolute inset-0 rounded-3xl pointer-events-none progress-ring"
            style={
              {
                '--progress': `${Math.max(
                  0,
                  Math.min(
                    1,
                    timeLeftMs /
                      ((mode === 'focus' ? focusDuration : breakDuration) *
                        1000),
                  ),
                ) * 360}deg`,
                '--ring-opacity': timerState === 'paused' ? 0.35 : 1,
                '--ring-color':
                  mode === 'focus'
                    ? 'rgba(16, 185, 129, 0.85)'
                    : 'rgba(20, 184, 166, 0.85)',
                '--ring-color-2':
                  mode === 'focus'
                    ? 'rgba(52, 211, 153, 0.85)'
                    : 'rgba(45, 212, 191, 0.85)',
              } as React.CSSProperties
            }
            animate={
              isRunning
                ? { opacity: [0.9, 1, 0.9] }
                : { opacity: 1 }
            }
            transition={
              isRunning
                ? { duration: 8, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0 }
            }
          />
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
          <AnimatePresence>
            {isRunning && (
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full pointer-events-none"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: [0.16, 0.28, 0.4, 0.28, 0.16],
                  scale: [1, 1.1, 1],
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  times: [0, 0.3, 0.5, 0.7, 1],
                }}
                style={{
                  background:
                    mode === 'focus'
                      ? 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%)'
                      : 'radial-gradient(circle, rgba(20, 184, 166, 0.35) 0%, transparent 70%)',
                }}
              />
            )}
          </AnimatePresence>

          <motion.div
            key={mode}
            className="relative z-10 flex flex-col items-center gap-5 sm:gap-6"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <motion.div
              className="text-6xl sm:text-7xl lg:text-8xl font-mono tracking-tight"
              style={{
                color:
                  mode === 'focus'
                    ? 'rgba(16, 185, 129, 0.95)'
                    : 'rgba(20, 184, 166, 0.9)',
                textShadow: isRunning
                  ? mode === 'focus'
                    ? '0 0 40px rgba(16, 185, 129, 0.4)'
                    : '0 0 40px rgba(20, 184, 166, 0.3)'
                  : 'none',
              }}
              initial={false}
              animate={{
                scale: isRunning && timeLeft <= 10 ? [1, 1.02, 1] : 1,
              }}
              transition={{
                duration: 1,
                repeat: isRunning && timeLeft <= 10 ? Infinity : 0,
              }}
            >
              {formatTime(timeLeft)}
            </motion.div>

            <motion.p
              className="text-sm text-gray-300/70 text-center max-w-sm"
              key={getMicrocopy(mode, timerState)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {getMicrocopy(mode, timerState)}
            </motion.p>

            <div className="flex items-center gap-3 sm:gap-4 mt-4">
              <motion.button
                onClick={handleStartPause}
                className="relative px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-medium overflow-hidden group"
                style={{
                  background:
                    mode === 'focus'
                      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 78, 59, 0.2) 100%)'
                      : 'linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(19, 78, 74, 0.2) 100%)',
                  border:
                    mode === 'focus'
                      ? '1px solid rgba(16, 185, 129, 0.3)'
                      : '1px solid rgba(20, 184, 166, 0.3)',
                  color: mode === 'focus' ? '#10b981' : '#14b8a6',
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2 }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {isRunning ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  {getButtonText()}
                </span>

                <motion.div
                  className="absolute inset-0"
                  style={{
                    background:
                      mode === 'focus'
                        ? 'rgba(16, 185, 129, 0.1)'
                        : 'rgba(20, 184, 166, 0.1)',
                  }}
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>

              <motion.button
                onClick={reset}
                className="px-3 py-3 sm:px-4 sm:py-4 rounded-2xl backdrop-blur-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: 'rgba(255, 255, 255, 0.5)',
                }}
                whileHover={{
                  scale: 1.05,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'rgba(255, 255, 255, 0.7)',
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <RotateCcw className="w-4 h-4" />
              </motion.button>

              <motion.button
                onClick={openSettings}
                className="px-3 py-3 sm:px-4 sm:py-4 rounded-2xl backdrop-blur-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: 'rgba(255, 255, 255, 0.5)',
                }}
                whileHover={{
                  scale: 1.05,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'rgba(255, 255, 255, 0.7)',
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Settings className="w-4 h-4" />
              </motion.button>
            </div>

            <div className="flex items-center gap-2 mt-3 text-[11px] sm:text-xs">
              <motion.button
                type="button"
                onClick={() => selectMode('focus')}
                className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full border transition-colors"
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
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2 }}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Focus className="w-3.5 h-3.5" />
                  Foco {formatShort(focusDuration)}
                </span>
              </motion.button>
              <motion.button
                type="button"
                onClick={() => selectMode('break')}
                className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full border transition-colors"
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
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2 }}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Coffee className="w-3.5 h-3.5" />
                  Pausa {formatShort(breakDuration)}
                </span>
              </motion.button>
            </div>
          </motion.div>

        </motion.div>

        <HistoryCard
          hasError={hasError}
          sessions={sessions}
          formatShort={formatShort}
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

        .progress-ring {
          border-radius: inherit;
          padding: 3px;
          opacity: var(--ring-opacity);
          background: conic-gradient(
            var(--ring-color) var(--progress),
            rgba(255, 255, 255, 0.08) 0
          );
          -webkit-mask: linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          transition: background 1s linear;
          will-change: background;
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

        @media (prefers-reduced-motion: reduce) {
          .dashboard-scope * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/50"
              onClick={() => setSettingsOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              className="relative w-full max-w-lg rounded-3xl p-6 sm:p-8 backdrop-blur-xl max-h-[85vh] overflow-y-auto"
              style={{
                background: 'rgba(10, 24, 26, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
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
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gray-300/50 mb-2">
                    Presets
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {presets.map((preset) => (
                      <motion.button
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
                        className="w-full px-4 py-3 sm:px-3 sm:py-2 rounded-2xl text-xs sm:text-xs border text-center transition-colors"
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
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
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
                      </motion.button>
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {settingsSaved && (
          <motion.div
            className="fixed left-1/2 bottom-6 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-xs"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            style={{
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: 'rgba(16, 185, 129, 0.95)',
              backdropFilter: 'blur(10px)',
            }}
          >
            Configurações salvas
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const HistoryCard = memo(function HistoryCard({
  hasError,
  sessions,
  formatShort,
}: {
  hasError: boolean
  sessions: PomodoroSession[]
  formatShort: (seconds: number) => string
}) {
  if (hasError) {
    return (
      <p className="text-sm text-red-500 text-center">
        Erro ao carregar histórico
      </p>
    )
  }

  return (
    <motion.div
      className="w-full rounded-3xl p-6 sm:p-8 backdrop-blur-xl"
      style={{
        background: 'rgba(255, 255, 255, 0.035)',
        border: '1px solid rgba(255, 255, 255, 0.09)',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h3 className="text-lg font-medium text-gray-200/80 mb-4">
        Histórico recente
      </h3>

      <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
        {sessions.length === 0 ? (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-gray-400/60 text-sm leading-relaxed">
              Seu histórico está vazio.
              <br />
              Comece uma sessão para acompanhar seu progresso.
            </p>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {sessions.map((session, index) => {
              const isFocus = session.type === 'FOCUS'

              return (
                <motion.div
                  key={session.id}
                  className="flex items-center gap-4 p-4 rounded-xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
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
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  )
})
