import { alertPresetIds } from './alertPresets'
import type { AlertPresetId } from './alertPresets'

type AlertSettings = { preset: AlertPresetId; volume: number }
const storageKey = 'retroglow.sound'
const defaults: AlertSettings = { preset: 'retro', volume: 65 }

export function readAlertSettings(): AlertSettings {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(storageKey) ?? 'null')
    if (value && typeof value === 'object') {
      const preset = 'preset' in value ? alertPresetIds.find((id) => id === value.preset) : undefined
      const volume = 'volume' in value && typeof value.volume === 'number' && Number.isFinite(value.volume)
        ? Math.round(Math.min(100, Math.max(0, value.volume)))
        : defaults.volume
      return { preset: preset ?? defaults.preset, volume }
    }
  } catch {
    // Use defaults when storage is unavailable or contains invalid JSON.
  }
  return defaults
}

export function saveAlertSettings(settings: AlertSettings) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(settings))
  } catch {
    // In-memory preferences still work.
  }
}
