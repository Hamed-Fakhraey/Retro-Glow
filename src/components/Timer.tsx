import { useEffect, useState } from 'react'
import { Icon } from './Tabs'
import TimeStepper from './TimeStepper'
import DigitalDigits from './DigitalDigits'

type TimerProps = { label: string; onFinish: () => void }
type TimerStatus = 'idle' | 'running' | 'paused' | 'finished'

const statusLabels: Record<TimerStatus, string> = {
  idle: 'آماده به کار',
  running: 'در حال شمارش',
  paused: 'متوقف شده',
  finished: 'زمان به پایان رسید!',
}

export default function Timer({ label, onFinish }: TimerProps) {
  const [minutes, setMinutes] = useState(5)
  const [seconds, setSeconds] = useState(0)
  const [status, setStatus] = useState<TimerStatus>('idle')
  const [deadline, setDeadline] = useState<number | null>(null)
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    if (deadline === null) return

    const interval = window.setInterval(() => {
      const next = Math.max(0, deadline - Date.now())
      setRemaining(next)
      if (next === 0) {
        window.clearInterval(interval)
        setDeadline(null)
        setStatus('finished')
        onFinish()
      }
    }, 100)
    return () => window.clearInterval(interval)
  }, [deadline, onFinish])

  const duration = (minutes * 60 + seconds) * 1000
  const running = status === 'running'
  const paused = status === 'paused'
  const displayed = Math.ceil((status === 'idle' ? duration : remaining) / 1000)

  function start() {
    const next = paused ? remaining : duration
    if (next <= 0) return
    setRemaining(next)
    setDeadline(Date.now() + next)
    setStatus('running')
  }

  function pause() {
    if (deadline === null) return
    const next = Math.max(0, deadline - Date.now())
    setRemaining(next)
    setDeadline(null)
    setStatus(next > 0 ? 'paused' : 'finished')
    if (next === 0) onFinish()
  }

  function reset() {
    setDeadline(null)
    setStatus('idle')
    setRemaining(0)
  }

  return (
    <div className="instrument-grid grid gap-4">
      <article className="glass clock-card timer-card" data-status={status}>
        <div className="card-heading flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2"><Icon name="timer" /> {label}</h2>
          <span className="live-label flex items-center gap-2" role="status"><span className="signal-dot" aria-hidden="true" /> {statusLabels[status]}</span>
        </div>
        <div className="display pixel-frame grid place-content-center justify-items-center">
          <div className="display-grid" aria-hidden="true" />
          <div role="timer" aria-label="زمان باقی‌مانده">
            <DigitalDigits parts={[Math.floor(displayed / 60), displayed % 60]} />
          </div>
          <div className="period">دقیقه : ثانیه</div>
        </div>
        <div className="clock-meta">شمارش معکوس در تب‌های دیگر هم ادامه دارد؛ هشدار پایان تا ۱۵ ثانیه پخش می‌شود.</div>
      </article>

      <aside className="glass control-card">
        <div className="card-heading flex items-center gap-2"><Icon name="timer" /><h2>تنظیم زمان</h2></div>
        <form onSubmit={(event) => { event.preventDefault(); if (running) pause(); else start() }}>
          <fieldset className="time-picker" disabled={running || paused} aria-label="مدت شمارش معکوس">
            <div className="time-picker-fields" dir="ltr">
              <TimeStepper label="دقیقه" min={0} max={99} value={minutes} onChange={(next) => { setMinutes(next); reset() }} />
              <span className="picker-colon" aria-hidden="true">:</span>
              <TimeStepper label="ثانیه" min={0} max={59} value={seconds} onChange={(next) => { setSeconds(next); reset() }} />
            </div>
          </fieldset>
          <div className="timer-actions grid grid-cols-2 gap-2">
            <button className="action primary flex items-center justify-center gap-2" type="submit" disabled={duration === 0}>
              <Icon name={running ? 'pause' : 'play'} /> {running ? 'مکث' : paused ? 'ادامه' : 'شروع'}
            </button>
            <button className="action flex items-center justify-center gap-2" type="button" onClick={reset}><Icon name="reset" /> بازنشانی</button>
          </div>
        </form>
      </aside>
    </div>
  )
}
