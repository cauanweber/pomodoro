export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  const mm = String(minutes).padStart(2, '0')
  const ss = String(remainingSeconds).padStart(2, '0')

  return `${mm}:${ss}`
}