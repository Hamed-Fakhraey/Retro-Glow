import { useEffect, useState } from 'react'
import { Icon } from './Tabs'
import { padTime } from '../lib/time'
import DigitalDigits from './DigitalDigits'

const persianDate = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric', month: 'long', day: 'numeric' })
const hijriDate = new Intl.DateTimeFormat('en-US-u-ca-islamic', { year: 'numeric', month: 'numeric', day: 'numeric', numberingSystem: 'arabext' })
const weekday = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { weekday: 'long' })

export default function Clock({ label }: { label: string }) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const interval = window.setInterval(() => {
      const current = new Date()
      setNow((previous) => Math.floor(current.getTime() / 1000) === Math.floor(previous.getTime() / 1000) ? previous : current)
    }, 250)
    return () => window.clearInterval(interval)
  }, [])

  const afterNoon = now.getHours() >= 12
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const seconds = now.getSeconds()
  const hijriParts = hijriDate.formatToParts(now)
  const hijri = ['year', 'month', 'day'].map((part) => hijriParts.find(({ type }) => type === part)?.value).join('/')

  return (
    <div className="instrument-grid grid gap-4">
      <article className="glass clock-card">
        <div className="card-heading flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2"><Icon name="clock" /> {label} محلی</h2>
          <span className="live-label flex items-center gap-2"><span className="signal-dot" aria-hidden="true" /> زنده</span>
        </div>
        <div className="display pixel-frame grid place-content-center justify-items-center">
          <div className="display-grid" aria-hidden="true" />
          <time dateTime={`${padTime(hours)}:${padTime(minutes)}:${padTime(seconds)}`}>
            <DigitalDigits parts={[hours % 12 || 12, minutes, seconds]} />
          </time>
          <div className="period flex items-center gap-2" dir="ltr">
            <span className="period-chip" lang="en">{afterNoon ? 'PM' : 'AM'}</span>
            <span dir="rtl">{afterNoon ? 'بعدازظهر' : 'قبل‌ازظهر'}</span>
          </div>
        </div>
        <div className="clock-meta flex items-center justify-between gap-2">
          <span className="flex items-center gap-2"><Icon name="globe" /> زمان محلی دستگاه</span>
          <span>نمایش ۱۲ ساعته</span>
        </div>
      </article>

      <aside className="glass date-card">
        <div className="card-heading flex items-center gap-2"><Icon name="calendar" /><h2>تقویم امروز</h2></div>
        <div className="date-entry flex items-center gap-3">
          <span className="date-icon solar grid shrink-0 place-items-center"><Icon name="calendar" /></span>
          <div><p>هجری شمسی</p><strong>{persianDate.format(now)}</strong></div>
        </div>
        <div className="date-entry flex items-center gap-3">
          <span className="date-icon lunar grid shrink-0 place-items-center"><Icon name="moon" /></span>
          <div><p>هجری قمری</p><strong><bdi dir="ltr">{hijri}</bdi></strong></div>
        </div>
        <div className="date-footer flex items-center justify-between gap-2">
          <span>روز هفته</span><strong>{weekday.format(now)}</strong>
        </div>
      </aside>
    </div>
  )
}
