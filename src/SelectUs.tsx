import React from 'react'
import FlipMove from 'react-flip-move'
import './SelectUs.css'

export type NameCard = {
  color: string
  name: string
}

export type Props = {
  items: NameCard[]
}
export const SelectUs: React.FunctionComponent<Props> = ({ items }) => (
  <FlipMove
    className='SelectUs'
    easing='ease'
    duration={300}
    delay={0}
    staggerDelayBy={20}
    staggerDurationBy={15}
    typeName='ol'
  >
    {items.map(({ color, name }, i) => (
      <li key={name} style={{ backgroundColor: color }} children={name} />
    ))}
  </FlipMove>
)
