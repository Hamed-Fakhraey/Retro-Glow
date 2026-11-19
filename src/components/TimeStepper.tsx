import { useState } from 'react'
import { Icon } from './Tabs'
import { padTime } from '../lib/time'

function latinDigits(value: string) {
  return value.replace(/[۰-۹٠-٩]/g, (digit) => String(digit.charCodeAt(0) & 15))
}

type TimeStepperProps = {
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}

export default function TimeStepper({ label, value, min, max, onChange }: TimeStepperProps) {
  const [draft, setDraft] = useState<string | null>(null)

  function step(delta: number) {
    const current = draft ? Math.min(max, Math.max(min, Number(draft))) : value
    const count = max - min + 1
    onChange(min + (current - min + count + delta) % count)
    setDraft(null)
  }

  return (
    <div className="time-field">
      <span className="time-field-label" lang="fa" dir="rtl">{label}</span>
      <button type="button" className="step-button" aria-label={`افزایش ${label}`} onClick={() => step(1)}>
        <Icon name="up" />
      </button>
      <input type="text" inputMode="numeric" autoComplete="off" spellCheck={false}
        aria-label={label} value={draft ?? padTime(value)}
        onFocus={(event) => event.currentTarget.select()}
        onChange={(event) => {
          const next = latinDigits(event.target.value)
          if (/^\d{0,2}$/.test(next)) setDraft(next)
        }}
        onBlur={() => {
          if (draft) onChange(Math.min(max, Math.max(min, Number(draft))))
          setDraft(null)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            event.currentTarget.blur()
          }
          if (event.key === 'Escape') setDraft(null)
          if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault()
            step(event.key === 'ArrowUp' ? 1 : -1)
            event.currentTarget.select()
          }
        }} />
      <button type="button" className="step-button" aria-label={`کاهش ${label}`} onClick={() => step(-1)}>
        <Icon name="down" />
      </button>
    </div>
  )
}
