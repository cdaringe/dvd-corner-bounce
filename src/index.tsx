import Phaser from 'phaser'
import { DvdScene, OnEdgeHit } from './DvdBuilder'
import { RotatingDeque } from './RotatingDeque'
import debounce from 'lodash/debounce'
import React from 'react'
import ReactDOM from 'react-dom'
import { SelectUs, NameCard } from './SelectUs'
import { RANDOM_COLORS } from './colors'

const DEFAULT_NAMES = [
  'han',
  'luke',
  'leia',
  'chewy',
  'old ben'
]

const getNames = () => {
  const rawNames = new URLSearchParams(window.location.search).get('names')
  if (!rawNames) return DEFAULT_NAMES
  try {
    return rawNames.split(',')
  } catch {
    return DEFAULT_NAMES
  }
}

async function go () {
  const selected: string[] = []
  const items = getNames()
  const humans = new RotatingDeque({
    items
  })
  const onEdgeHit: OnEdgeHit = ({ scene }) => {
    if (!humans.deque.length) return
    humans.rotate()
    scene.textNodes[0].setText(humans.deque[0 % humans.length])
    scene.textNodes[1].setText(humans.deque[1 % humans.length])
    scene.textNodes[2].setText(humans.deque[2 % humans.length])
    scene.textNodes[3].setText(humans.deque[3 % humans.length])
    renderSelectUs()
  }
  const onCornerHit: OnEdgeHit = ({ corner, scene }) => {
    const cornerIdx =
      corner === 'TR'
        ? 0
        : corner === 'TL'
          ? 1
          : corner === 'BL'
            ? 2
            : corner === 'BR'
              ? 3
              : 0
    const idxToSelect = cornerIdx % humans.length
    console.log(`selected: ${humans.deque[idxToSelect]}`)
    const _selected = humans.deque.splice(idxToSelect, 1)[0]
    selected.push(_selected)
    renderSelected()
    if (humans.length) {
      onEdgeHit({ scene })
    } else {
      scene.game.destroy(false)
    }
  }
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.WEBGL,
    width: 800,
    height: 600,
    backgroundColor: '#f00',
    parent: 'game',
    physics: { default: 'arcade' },
    scene: new DvdScene({ active: true, onCornerHit, onEdgeHit })
  }
  new Phaser.Game(config) // eslint-disable-line

  const colorsByHumanName = humans.deque.reduce(
    (acc, name, i) => ({
      [name]: RANDOM_COLORS[i],
      ...acc
    }),
    {} as { [name: string]: string }
  )

  const renderSelectUs = debounce(
    () => {
      const items: NameCard[] = humans.deque.map((name, i) => ({
        color: colorsByHumanName[name],
        name
      }))
      ReactDOM.render(
        <SelectUs items={items} />,
        window.document.getElementById('to_be_selected')
      )
    },
    100,
    { leading: true }
  )
  const renderSelected = debounce(
    () => {
      const items: NameCard[] = selected.map((name, i) => ({
        color: colorsByHumanName[name],
        name
      }))
      ReactDOM.render(
        <SelectUs items={items} />,
        window.document.getElementById('selected')
      )
    },
    100,
    { leading: true }
  )
  renderSelectUs()
}
go()
