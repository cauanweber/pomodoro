import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Play, Pause, RotateCcw, Coffee, Focus } from 'lucide-react'

import { usePomodoro } from '../hooks/usePomodoro'
import { getPomodoroSessions } from '../services/pomodoroService'
import type { PomodoroSession } from '../types/pomodoro'
import { formatTime } from '../utils/time'
import { getMicrocopy } from '../utils/microcopy'

const BG_RUNNING = [
  'radial-gradient(circle at 14% 18%, rgba(16, 185, 129, 0.22) 0%, rgba(6, 78, 59, 0.12) 40%, transparent 65%), radial-gradient(circle at 86% 82%, rgba(255, 255, 255, 0.05) 0%, transparent 55%), linear-gradient(135deg, #0a1c1a 0%, #122428 55%, #243c40 100%)',
  'radial-gradient(circle at 20% 24%, rgba(20, 184, 166, 0.22) 0%, rgba(19, 78, 74, 0.12) 40%, transparent 65%), radial-gradient(circle at 80% 76%, rgba(255, 255, 255, 0.06) 0%, transparent 55%), linear-gradient(135deg, #0a1c1a 0%, #122428 55%, #243c40 100%)',
  'radial-gradient(circle at 14% 18%, rgba(16, 185, 129, 0.22) 0%, rgba(6, 78, 59, 0.12) 40%, transparent 65%), radial-gradient(circle at 86% 82%, rgba(255, 255, 255, 0.05) 0%, transparent 55%), linear-gradient(135deg, #0a1c1a 0%, #122428 55%, #243c40 100%)',
]
const BG_IDLE =
  'radial-gradient(circle at 14% 18%, rgba(16, 185, 129, 0.18) 0%, rgba(6, 78, 59, 0.1) 40%, transparent 65%), radial-gradient(circle at 86% 82%, rgba(255, 255, 255, 0.05) 0%, transparent 55%), linear-gradient(135deg, #0a1c1a 0%, #122428 55%, #243c40 100%)'

export function Dashboard() {
  const { mode, timeLeft, timerState, start, pause, reset, selectMode } =
    usePomodoro()

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
    fetchSessions()

    const interval = setInterval(fetchSessions, 5000)
    return () => clearInterval(interval)
  }, [fetchSessions])

  const isRunning = timerState === 'running'

  const getButtonText = () => {
    if (mode === 'focus') {
      return timerState === 'running' ? 'Pausar foco' : 'Iniciar foco'
    }
    return timerState === 'running' ? 'Pausar pausa' : 'Iniciar pausa'
  }

  return (
    <div
      className="dashboard-scope relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6"
      style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}
    >
      <motion.div
        className="absolute inset-0 -z-10"
        animate={{
          background: isRunning ? BG_RUNNING : BG_IDLE,
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
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
            animate={{ opacity: [0.12, 0.22, 0.12] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
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
              animate={{ opacity: [0.2, 0.35, 0.2] }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
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
          <AnimatePresence>
            {isRunning && (
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full pointer-events-none"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: [0.2, 0.35, 0.2],
                  scale: [1, 1.1, 1],
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
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
                onClick={isRunning ? pause : start}
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
                  Foco 25min
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
                  Pausa 5min
                </span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {hasError ? (
          <p className="text-sm text-red-500 text-center">
            Erro ao carregar histórico
          </p>
        ) : (
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
                            <Focus
                              className="w-4 h-4"
                              style={{ color: '#10b981' }}
                            />
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
                            {Math.floor(session.duration / 60)}min
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
        )}
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

        @media (prefers-reduced-motion: reduce) {
          .dashboard-scope * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  )
}
