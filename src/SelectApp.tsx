import React from 'react'
import { SelectUs, NameCard } from './SelectUs'

export class SelectApp extends React.PureComponent<{
  toBeSelected: NameCard[],
  selected: NameCard[]
}> {
  render () {
    const { selected, toBeSelected} = this.props
    return (
      <div>
        <h1 children='To be selected' />
        <SelectUs items={toBeSelected} />
        <hr />
        <h1 children='Selected' />
        <SelectUs items={selected} />
      </div>
    )
  }
}
