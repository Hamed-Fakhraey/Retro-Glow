import { Icon } from './Tabs'

type AlertBannerProps = {
  icon: 'alarm' | 'timer'
  message: string
  stopLabel: string
  onStop: () => void
}

export default function AlertBanner({ icon, message, stopLabel, onStop }: AlertBannerProps) {
  return (
    <div className="alarm-banner flex items-center justify-between gap-3">
      <strong className="flex items-center gap-2" role="alert"><Icon name={icon} /> {message}</strong>
      <button className="action primary flex items-center gap-2" type="button" onClick={onStop}>
        <Icon name="stop" /> {stopLabel}
      </button>
    </div>
  )
}
