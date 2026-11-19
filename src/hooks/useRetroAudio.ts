import { useCallback, useEffect, useRef, useState } from 'react'
import { createAlertAudio } from '../lib/alertAudio'
import type { AlertChannel, AlertOptions, AudioStatus } from '../lib/alertAudio'

export default function useRetroAudio(volume: number) {
  const engine = useRef<ReturnType<typeof createAlertAudio> | null>(null)
  const [status, setStatus] = useState<AudioStatus>('locked')

  const unlock = useCallback(() => engine.current?.unlock(), [])

  useEffect(() => {
    const current = createAlertAudio(setStatus)
    engine.current = current
    window.addEventListener('click', unlock)
    window.addEventListener('keydown', unlock)
    if (window.retroGlowDesktop) unlock()
    return () => {
      window.removeEventListener('click', unlock)
      window.removeEventListener('keydown', unlock)
      engine.current = null
      current.dispose()
    }
  }, [unlock])

  useEffect(() => engine.current?.setVolume(volume), [volume])

  const playAlert = useCallback((channel: AlertChannel, options: AlertOptions) => (
    engine.current?.play(channel, options) ?? false
  ), [])
  const stopAlert = useCallback((channel: AlertChannel) => engine.current?.stop(channel), [])

  return { playAlert, stopAlert, unlock, status }
}
