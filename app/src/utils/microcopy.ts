type Mode = 'focus' | 'break'
type TimerState = 'idle' | 'running' | 'paused'

export function getMicrocopy(mode: Mode, timerState: TimerState): string {
  if (mode === 'focus') {
    if (timerState === 'running') {
      return 'Você está fazendo um ótimo trabalho. Continue focado.'
    }
    if (timerState === 'paused') {
      return 'Quando estiver pronto, retome seu foco.'
    }
    return 'Pronto para começar uma sessão de foco profundo?'
  }

  if (timerState === 'running') {
    return 'Respire. Relaxe. Você merece esse momento.'
  }
  if (timerState === 'paused') {
    return 'Sem pressa. Continue descansando quando quiser.'
  }
  return 'Hora de uma pausa bem merecida.'
}
