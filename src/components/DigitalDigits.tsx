import { Fragment } from 'react'
import { padTime } from '../lib/time'

export default function DigitalDigits({ parts }: { parts: readonly [number, number, number?] }) {
  return (
    <span className="digit-row" dir="ltr">
      {parts.map((value, position) => value !== undefined && (
        <Fragment key={position}>
          {position > 0 && <span className="digit-colon">:</span>}
          <span className="digit-pair">{padTime(value)}</span>
        </Fragment>
      ))}
    </span>
  )
}
