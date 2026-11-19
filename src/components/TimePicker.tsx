import TimeStepper from './TimeStepper'
import { padTime } from '../lib/time'

export default function TimePicker({ time, onChange, disabled }: { time: string; onChange: (time: string) => void; disabled: boolean }) {
  const [hours, minutes] = time.split(':').map(Number)
  const isPM = hours >= 12
  const hour = hours % 12 || 12

  function update(nextHour: number, nextMinute: number, nextPM: boolean) {
    onChange(`${padTime(nextHour % 12 + (nextPM ? 12 : 0))}:${padTime(nextMinute)}`)
  }

  return (
    <fieldset className="time-picker" disabled={disabled}>
      <legend>زمان هشدار</legend>
      <div className="time-picker-fields with-period" dir="ltr">
        <TimeStepper label="ساعت" min={1} max={12} value={hour} onChange={(next) => update(next, minutes, isPM)} />
        <span className="picker-colon" aria-hidden="true">:</span>
        <TimeStepper label="دقیقه" min={0} max={59} value={minutes} onChange={(next) => update(hour, next, isPM)} />
        <div className="time-field">
          <span className="time-field-label" dir="rtl">نیم‌روز</span>
          <div className="period-options" role="group" aria-label="قبل یا بعد از ظهر">
            <button type="button" lang="en" aria-pressed={!isPM} onClick={() => update(hour, minutes, false)}>AM</button>
            <button type="button" lang="en" aria-pressed={isPM} onClick={() => update(hour, minutes, true)}>PM</button>
          </div>
        </div>
      </div>
    </fieldset>
  )
}
