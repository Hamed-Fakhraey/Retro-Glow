import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { themes } from '../lib/themes'
import type { Theme } from '../lib/themes'
import { alertPresetIds, alertPresets } from '../lib/alertPresets'
import type { AlertPresetId } from '../lib/alertPresets'
import type { AudioStatus } from '../lib/alertAudio'
import { Icon } from './Tabs'

const persianNumber = new Intl.NumberFormat('fa-IR')

type SettingsMenuProps = {
  theme: Theme
  onThemeChange: (theme: Theme) => void
  preset: AlertPresetId
  onPresetChange: (preset: AlertPresetId) => void
  preview: AlertPresetId | null
  onPreview: (preset: AlertPresetId) => void
  onStopPreview: () => void
  soundStatus: AudioStatus
  alertActive: boolean
  volume: number
  onVolumeChange: (volume: number) => void
}

export default function SettingsMenu({
  theme, onThemeChange, preset, onPresetChange, preview, onPreview, onStopPreview,
  soundStatus, alertActive, volume, onVolumeChange,
}: SettingsMenuProps) {
  const [open, setOpen] = useState(false)
  const menu = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const panelId = useId()
  const presetName = useId()

  const close = useCallback(() => {
    onStopPreview()
    setOpen(false)
  }, [onStopPreview])

  useEffect(() => {
    if (!open) return
    function dismissOutside(event: PointerEvent) {
      if (event.target instanceof Node && !menu.current?.contains(event.target)) close()
    }
    document.addEventListener('pointerdown', dismissOutside)
    return () => document.removeEventListener('pointerdown', dismissOutside)
  }, [close, open])

  function closeAndFocus() {
    trigger.current?.focus()
    close()
  }

  return (
    <div ref={menu} className="theme-switcher"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.preventDefault()
          closeAndFocus()
        }
      }}
      onBlur={(event) => {
        if (open && event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) close()
      }}>
      <button ref={trigger} type="button" className="theme-trigger" data-palette={theme}
        aria-expanded={open} aria-controls={panelId} onClick={() => { if (open) close(); else setOpen(true) }}>
        <Icon name="menu" />
        <span>تنظیمات</span>
        <span className="theme-swatch" aria-hidden="true" />
      </button>
      <div id={panelId} className="settings-panel" hidden={!open}>
        <fieldset className="settings-section">
          <legend>پوستهٔ برنامه</legend>
          <div className="theme-options" dir="ltr">
            {themes.map(({ id, label }) => (
              <button key={id} type="button" className="theme-option" data-palette={id}
                aria-pressed={theme === id} onClick={() => { onThemeChange(id); closeAndFocus() }}>
                <span className="theme-swatch" aria-hidden="true" />
                <span lang="en">{label}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="settings-section sound-section">
          <legend>صدای هشدار</legend>
          <div className="sound-options">
            {alertPresetIds.map((id) => {
              const { label } = alertPresets[id]
              return (
                <div key={id} className="sound-option">
                  <label className="sound-choice">
                    <input type="radio" name={presetName} checked={preset === id} onChange={() => onPresetChange(id)} />
                    <span>{label}</span>
                  </label>
                  <button type="button" className="sound-preview"
                    aria-label={`${preview === id ? 'توقف پیش‌شنیدن' : 'پیش‌شنیدن'}: ${label}`}
                    title={preview === id ? 'توقف پیش‌شنیدن' : 'پیش‌شنیدن'}
                    disabled={alertActive || soundStatus === 'unavailable'}
                    onClick={() => { if (preview === id) onStopPreview(); else onPreview(id) }}>
                    <Icon name={preview === id ? 'stop' : 'play'} />
                  </button>
                </div>
              )
            })}
          </div>
          <label className="sound-volume">
            <span>بلندی صدا</span>
            <input type="range" dir="ltr" min="0" max="100" value={volume}
              onChange={(event) => onVolumeChange(Number(event.currentTarget.value))} />
            <span className="volume-value" aria-hidden="true">{persianNumber.format(volume)}٪</span>
          </label>
          <p className="sound-note" role="status">
            {soundStatus === 'unavailable'
              ? 'مرورگر امکان پخش صدا را ندارد.'
              : alertActive
                ? 'پیش‌شنیدن پس از پایان هشدار در دسترس است.'
                : soundStatus === 'locked'
                  ? 'برای فعال‌کردن صدا، با برنامه تعامل کنید یا دکمهٔ پیش‌شنیدن را بزنید.'
                  : 'این صدا برای زنگ هشدار و شمارش معکوس استفاده می‌شود.'}
          </p>
          <p className="sound-note">هشدارها فقط تا زمانی کار می‌کنند که برنامه باز باشد.</p>
        </fieldset>
      </div>
    </div>
  )
}
