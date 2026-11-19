import { Icon } from './Tabs'
import TimePicker from './TimePicker'
import DigitalDigits from './DigitalDigits'

type AlarmProps = {
  label: string
  enabled: boolean
  time: string
  ringing: boolean
  setTime: (time: string) => void
  toggleEnabled: () => void
}

export default function Alarm({ label, enabled, time, ringing, setTime, toggleEnabled }: AlarmProps) {
  const [hour, minute] = time.split(':').map(Number)

  return (
    <div className="instrument-grid grid gap-4">
      <article className="glass clock-card alarm-card" data-ringing={ringing} data-enabled={enabled}>
        <div className="card-heading flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2"><Icon name="alarm" /> {label}</h2>
          <span className="live-label flex items-center gap-2">
            <span className="signal-dot" aria-hidden="true" /> {ringing ? 'در حال پخش' : enabled ? 'فعال' : 'خاموش'}
          </span>
        </div>
        <div className="display pixel-frame grid place-content-center justify-items-center">
          <div className="display-grid" aria-hidden="true" />
          <time dateTime={time}>
            <DigitalDigits parts={[hour % 12 || 12, minute]} />
          </time>
          <div className="period flex items-center gap-2" dir="ltr">
            <span className="period-chip" lang="en">{hour >= 12 ? 'PM' : 'AM'}</span>
            <span dir="rtl">زمان تنظیم‌شده</span>
          </div>
        </div>
        <div className="clock-meta">صدای هشدار تکرار می‌شود تا «توقف آلارم» را بزنید.</div>
      </article>

      <aside className="glass control-card alarm-controls">
        <div className="card-heading flex items-center gap-2"><Icon name="alarm" /><h2>تنظیم هشدار</h2></div>
        <TimePicker time={time} disabled={ringing} onChange={setTime} />
        <button type="button" className="switch-row flex w-full items-center justify-between gap-2" role="switch"
          aria-checked={enabled} disabled={ringing}
          onClick={toggleEnabled}>
          فعال‌سازی زنگ <span className="switch-track" aria-hidden="true"><span /></span>
        </button>
      </aside>
    </div>
  )
}
