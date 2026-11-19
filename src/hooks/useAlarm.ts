import { useEffect, useState } from 'react'

type Settings = { time: string; enabled: boolean }

const storageKey = 'retroglow.alarm'
const defaultSettings: Settings = { time: '07:00', enabled: false }
const validTime = /^([01]\d|2[0-3]):[0-5]\d$/

function readSettings(): Settings {
  try {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      const candidate: unknown = JSON.parse(saved)
      if (candidate && typeof candidate === 'object' && 'time' in candidate && 'enabled' in candidate &&
          typeof candidate.time === 'string' && validTime.test(candidate.time) &&
          typeof candidate.enabled === 'boolean') {
        return { time: candidate.time, enabled: candidate.enabled }
      }
    }
  } catch {
    return defaultSettings
  }
  return defaultSettings
}

function nextOccurrence(time: string, now: Date) {
  const [hour, minute] = time.split(':').map(Number)
  const target = new Date(now)
  target.setHours(hour, minute, 0, 0)
  if (target.getTime() + 60_000 <= now.getTime()) {
    target.setDate(target.getDate() + 1)
    target.setHours(hour, minute, 0, 0)
  }
  return target.getTime()
}

export default function useAlarm(onRing: () => void, onStop: () => void) {
  const [settings, setSettings] = useState(readSettings)
  const [ringing, setRinging] = useState(false)
  const { enabled, time } = settings

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(settings))
    } catch {
      return
    }
  }, [settings])

  useEffect(() => {
    if (!enabled) return

    const target = nextOccurrence(time, new Date())
    const interval = window.setInterval(() => {
      if (Date.now() < target) return
      window.clearInterval(interval)
      setRinging(true)
      onRing()
    }, 250)
    return () => window.clearInterval(interval)
  }, [enabled, onRing, time])

  function stop() {
    onStop()
    setRinging(false)
    setSettings((current) => ({ ...current, enabled: false }))
  }

  function setTime(next: string) {
    if (ringing) return
    setSettings((current) => ({ ...current, time: next }))
  }

  function toggleEnabled() {
    if (ringing) return
    setSettings((current) => ({ ...current, enabled: !current.enabled }))
  }

  return { enabled, time, ringing, stop, setTime, toggleEnabled }
}
