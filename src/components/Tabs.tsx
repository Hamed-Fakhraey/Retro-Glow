import type { KeyboardEvent } from 'react'

export type TabId = 'clock' | 'timer' | 'alarm'
export type TabItem = { id: TabId; label: string }
type IconName = TabId | 'brand' | 'calendar' | 'moon' | 'globe' | 'play' | 'pause' | 'reset' | 'up' | 'down' | 'stop' | 'menu' | 'check'

const paths: Record<IconName, string> = {
  clock: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z M12 7v5l3 2',
  timer: 'M9 2h6m-3 4a8 8 0 1 0 .01 0ZM19 5l2 2m-9 3v4l2 1',
  alarm: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Zm-8 12a2 2 0 0 0 4 0',
  brand: 'M4 7V4h3m10 0h3v3m0 10v3h-3M7 20H4v-3m4-4h3l1-5 2 8 1-3h2',
  calendar: 'M7 3v4m10-4v4M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm3 8h2m4 0h2m-8 3h2',
  moon: 'M20.7 14.3A8.5 8.5 0 0 1 9.7 3.3a8.5 8.5 0 1 0 11 11ZM17 4v4m-2-2h4',
  globe: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3a15 15 0 0 1 0 18m0-18a15 15 0 0 0 0 18',
  play: 'm9 5 11 7-11 7V5Z',
  pause: 'M9 5v14m6-14v14',
  up: 'm6 15 6-6 6 6',
  down: 'm6 9 6 6 6-6',
  stop: 'M6 6h12v12H6z',
  menu: 'M4 6h16M4 12h16M4 18h16',
  check: 'm5 12 4 4L19 6',
  reset: 'M4 10a8 8 0 1 1 1 7m-1-7V5m0 5h5',
}

export function Icon({ name }: { name: IconName }) {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name]} />
    </svg>
  )
}

type TabsProps = { items: readonly TabItem[]; active: TabId; onChange: (tab: TabId) => void }

export default function Tabs({ items, active, onChange }: TabsProps) {
  function moveFocus(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = items.length - 1
    let next: number
    switch (event.key) {
      case 'ArrowLeft': next = (index + 1) % items.length; break
      case 'ArrowRight': next = (index + last) % items.length; break
      case 'Home': next = 0; break
      case 'End': next = last; break
      default: return
    }
    event.preventDefault()
    const { id } = items[next]
    onChange(id)
    document.getElementById(`tab-${id}`)?.focus()
  }

  return (
    <div className="tabs grid grid-cols-3" role="tablist" aria-label="ابزارهای زمان">
      {items.map(({ id, label }, index) => (
        <button key={id} type="button" role="tab" id={`tab-${id}`} aria-controls={`panel-${id}`}
          aria-selected={active === id} tabIndex={active === id ? 0 : -1}
          className="tab-button flex items-center justify-center gap-2"
          onClick={() => onChange(id)} onKeyDown={(event) => moveFocus(event, index)}>
          <Icon name={id} />
          {label}
        </button>
      ))}
    </div>
  )
}
