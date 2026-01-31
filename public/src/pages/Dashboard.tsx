/**
 * =====================================================
 * =                    Dashboard                     =
 * =====================================================
 *
 * Página principal do Pomodoro.
 * Controla o timer, exibe histórico e
 * gerencia o estado visual do fundo.
 */

/**
 * =====================================================
 * =               Componentes UI                     =
 * =====================================================
 */

import { Background } from '../components/Background'
import { MainCard } from '../components/MainCard'
import { TimerDisplay } from '../components/TimerDisplay'
import { Controls } from '../components/Controls'
import { HistoryCard } from '../components/HistoryCard'

/**
 * =====================================================
 * =               Hooks e Serviços                   =
 * =====================================================
 */

import { usePomodoro } from '../hooks/usePomodoro'
import { getPomodoroSessions } from '../services/pomodoroService'

/**
 * =====================================================
 * =               Tipos e Hooks Core                 =
 * =====================================================
 */

import { useEffect, useState, useCallback } from 'react'
import type { PomodoroSession } from '../types/pomodoro'

export function Dashboard() {
  const { mode, timeLeft, isRunning, start, pause, reset } = usePomodoro()

  const [sessions, setSessions] = useState<PomodoroSession[]>([])
  const [hasError, setHasError] = useState(false)

  /**
   * =================================================
   * =          Busca histórico de sessões            =
   * =================================================
   * Executa polling para manter o histórico
   * sincronizado com o backend.
   */
  const fetchSessions = useCallback(async () => {
    try {
      const data = await getPomodoroSessions()
      setSessions(data)
      setHasError(false)
    } catch {
      setHasError(true)
    }
  }, [])

  /**
   * =================================================
   * =               Efeito de Polling               =
   * =================================================
   */
  useEffect(() => {
    fetchSessions()

    const interval = setInterval(fetchSessions, 5000)
    return () => clearInterval(interval)
  }, [fetchSessions])

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center p-6">
      <Background isRunning={isRunning} />

      <div className="relative z-10 w-full max-w-xl flex flex-col gap-8">
        <MainCard isRunning={isRunning} mode={mode}>
          <TimerDisplay
            timeLeft={timeLeft}
            mode={mode}
            isRunning={isRunning}
          />

          <Controls
            isRunning={isRunning}
            mode={mode}
            onStart={start}
            onPause={pause}
            onReset={reset}
          />
        </MainCard>

        {hasError ? (
          <p className="text-sm text-red-500 text-center">
            Erro ao carregar histórico
          </p>
        ) : (
          <HistoryCard sessions={sessions} />
        )}
      </div>
    </div>
  )
}