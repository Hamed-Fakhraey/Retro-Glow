import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import Alarm from './components/Alarm'
import AlertBanner from './components/AlertBanner'
import Clock from './components/Clock'
import Tabs, { Icon } from './components/Tabs'
import type { TabId, TabItem } from './components/Tabs'
import Timer from './components/Timer'
import SettingsMenu from './components/SettingsMenu'
import { readTheme, themeKey } from './lib/themes'
import { readAlertSettings, saveAlertSettings } from './lib/alertSettings'
import { alertPresets } from './lib/alertPresets'
import type { AlertPresetId } from './lib/alertPresets'
import useRetroAudio from './hooks/useRetroAudio'
import useAlarm from './hooks/useAlarm'

const tabKey = 'retroglow.tab'
const countdownAlertMs = 15_000

function reportDesktopAlert(kind: 'alarm' | 'timer') {
  void window.retroGlowDesktop?.alertFired(kind).catch((error) => {
    console.error('Could not show the desktop alert:', error)
  })
}

const tabs: readonly TabItem[] = [
  { id: 'clock', label: 'ساعت' },
  { id: 'timer', label: 'شمارش معکوس' },
  { id: 'alarm', label: 'زنگ هشدار' },
]

function initialTab(): TabId {
  try {
    const saved = localStorage.getItem(tabKey)
    return tabs.find(({ id }) => id === saved)?.id ?? 'clock'
  } catch {
    return 'clock'
  }
}

export default function App() {
  const [active, setActive] = useState(initialTab)
  const [theme, setTheme] = useState(readTheme)
  const [sound, setSound] = useState(readAlertSettings)
  const selectedPreset = useRef(sound.preset)
  const [preview, setPreview] = useState<AlertPresetId | null>(null)
  const [flash, setFlash] = useState(false)
  const [timerAlert, setTimerAlert] = useState(false)
  const flashTimeout = useRef<number | undefined>(undefined)
  const { playAlert, stopAlert, unlock, status: soundStatus } = useRetroAudio(sound.volume)
  const ringAlarm = useCallback(() => {
    playAlert('alarm', { preset: selectedPreset.current })
    reportDesktopAlert('alarm')
  }, [playAlert])
  const stopAlarm = useCallback(() => stopAlert('alarm'), [stopAlert])
  const alarm = useAlarm(ringAlarm, stopAlarm)

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(themeKey, theme)
    } catch {
      // Themes still work when storage is unavailable.
    }
  }, [theme])

  useEffect(() => {
    try {
      localStorage.setItem(tabKey, active)
    } catch {
      return
    }
  }, [active])

  useEffect(() => saveAlertSettings(sound), [sound])
  useEffect(() => () => window.clearTimeout(flashTimeout.current), [])

  const stopPreview = useCallback(() => stopAlert('preview'), [stopAlert])

  function changePreset(preset: AlertPresetId) {
    if (selectedPreset.current === preset) return
    stopPreview()
    selectedPreset.current = preset
    setSound((current) => ({ ...current, preset }))
  }

  function previewPreset(preset: AlertPresetId) {
    const started = playAlert('preview', {
      preset,
      durationMs: alertPresets[preset].cycleSeconds * 1000,
      onEnd: () => setPreview(null),
    })
    if (started) {
      setPreview(preset)
      unlock()
    }
  }

  const finishTimer = useCallback(() => {
    playAlert('timer', {
      preset: selectedPreset.current,
      durationMs: countdownAlertMs,
      onEnd: () => setTimerAlert(false),
    })
    setTimerAlert(true)
    reportDesktopAlert('timer')
    window.clearTimeout(flashTimeout.current)
    setFlash(true)
    flashTimeout.current = window.setTimeout(() => setFlash(false), 900)
  }, [playAlert])

  function stopTimerAlert() {
    stopAlert('timer')
    setTimerAlert(false)
  }

  return (
    <div className="site-shell mx-auto flex min-h-svh w-full flex-col">
      <header className="site-header flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="brand-icon grid place-items-center"><Icon name="brand" /></span>
          <span className="wordmark" dir="ltr" lang="en">Retro<span>Glow</span></span>
        </div>
        <SettingsMenu theme={theme} onThemeChange={setTheme} preset={sound.preset} onPresetChange={changePreset}
          preview={preview} onPreview={previewPreset} onStopPreview={stopPreview} soundStatus={soundStatus}
          alertActive={timerAlert || alarm.ringing} volume={sound.volume}
          onVolumeChange={(volume) => setSound((current) => ({ ...current, volume }))} />
      </header>

      <main className="dashboard mx-auto w-full flex-1">
        <div className="intro text-center">
          <div className="eyebrow flex items-center justify-center gap-2">
            <span aria-hidden="true" /> زمان‌سنج رترو <span aria-hidden="true" />
          </div>
          <h1>ایستگاه زمان</h1>
          <p>ساعت، شمارش معکوس و زنگ هشدار؛ با حال‌وهوای پیکسلی.</p>
        </div>

        <div className="desktop-window">
          <div className="window-titlebar flex items-center justify-between gap-2">
            <span className="flex items-center gap-2"><Icon name="brand" /> ابزارهای زمان</span>
            <span className="window-marks flex items-center gap-2" aria-hidden="true"><i /><i /><i /></span>
          </div>
          <Tabs items={tabs} active={active} onChange={setActive} />

          {tabs.map(({ id, label }) => (
            <section key={id} id={`panel-${id}`} role="tabpanel" aria-labelledby={`tab-${id}`} tabIndex={0}
              className="tab-panel" hidden={active !== id}>
              {id === 'clock' && <Clock label={label} />}
              {id === 'timer' && <Timer label={label} onFinish={finishTimer} />}
              {id === 'alarm' && <Alarm label={label} enabled={alarm.enabled} time={alarm.time}
                ringing={alarm.ringing} setTime={alarm.setTime} toggleEnabled={alarm.toggleEnabled} />}
            </section>
          ))}

          <div className="window-status flex items-center justify-between gap-3">
            <span className="flex items-center gap-2"><span className="signal-dot" aria-hidden="true" /> سامانه فعال</span>
            <span className="status-code" lang="en" dir="ltr">RETRO / TIME MODULE</span>
          </div>
        </div>
      </main>

      <footer className="site-footer flex flex-wrap items-center justify-between gap-x-5 gap-y-2">
        <span className="flex items-center gap-2"><Icon name="globe" /> زمان و تاریخ بر اساس دستگاه شما</span>
        {window.retroGlowDesktop && <span>هشدارها فقط تا وقتی RetroGlow در پنجره یا کنار ساعت ویندوز در حال اجراست، فعال‌اند.</span>}
        <span className="footer-decoration flex items-center gap-1.5" aria-hidden="true"><i /><i /><i /></span>
      </footer>
      {(timerAlert || alarm.ringing) && (
        <div className="alert-stack">
          {alarm.ringing && <AlertBanner icon="alarm" message="زنگ هشدار!" stopLabel="توقف آلارم" onStop={alarm.stop} />}
          {timerAlert && <AlertBanner icon="timer" message="شمارش معکوس به پایان رسید!" stopLabel="توقف صدای تایمر" onStop={stopTimerAlert} />}
          {soundStatus !== 'ready' && (
            <p className="alert-audio-note" role="status">
              {soundStatus === 'locked'
                ? 'برای فعال‌کردن صدای هشدار، روی برنامه کلیک کنید یا یک کلید بزنید.'
                : 'مرورگر امکان پخش صدا را ندارد.'}
            </p>
          )}
        </div>
      )}
      {flash && <div className="screen-flash" aria-hidden="true" />}
    </div>
  )
}
