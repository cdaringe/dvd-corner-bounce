import Phaser, { Scene } from 'phaser'

export type Corner = 'TR' | 'TL' | 'BL' | 'BR'
export type OnEdgeHit = (hitMeta: { corner?: Corner; scene: DvdScene }) => void

export class DvdScene extends Scene {
  public encroachingBoundaryDims: [number, number] = [0, 0]
  public dvd!: Phaser.Physics.Arcade.Sprite
  public onCornerHit: OnEdgeHit
  public onEdgeHit: OnEdgeHit
  public isNameSelectMode: boolean = false
  public textNodes!: [
    Phaser.GameObjects.Text,
    Phaser.GameObjects.Text,
    Phaser.GameObjects.Text,
    Phaser.GameObjects.Text
  ]

  constructor (
    props: Phaser.Types.Scenes.SettingsConfig & {
      onCornerHit: OnEdgeHit
      onEdgeHit: OnEdgeHit
      isNameSelectMode: boolean
    }
  ) {
    super(props)
    this.onCornerHit = props.onCornerHit
    this.onEdgeHit = props.onEdgeHit
    this.isNameSelectMode = props.isNameSelectMode
  }

  preload () {
    this.load.image('dvd', require('./dvd-logo.jpg'))
  }

  create () {
    const { width, height } = this.sys.game.canvas
    const [tr, tl, bl, br] = [
      this.add.text(width - 20, 0, 'TR', { font: '16px Arial' }),
      this.add.text(0, 0, 'TL', { font: '16px Arial' }),
      this.add.text(0, height - 20, 'BL', { font: '16px Arial' }),
      this.add.text(width - 20, height - 20, 'BR', { font: '16px Arial' })
    ].map(text => {
      // text.setTint(0xff00ff, 0xffff00, 0x0000ff, 0xff0000)
      return text
    })
    this.textNodes = [tr, tl, bl, br]
    this.encroachingBoundaryDims = [width, height]
    const encroachingBoundary = this.add.rectangle(
      0,
      0,
      width,
      height,
      0x0000ff,
      1
    )
    this.physics.add.existing(encroachingBoundary)
    encroachingBoundary.setOrigin(0, 0)
    const dvd = (this.dvd = this.physics.add.sprite(
      Math.random() * width,
      Math.random() * height,
      'dvd'
    ))
    dvd.setVelocity(100, 200)
    dvd.setBounce(1, 1)
    dvd.setCollideWorldBounds(true)
    if (!this.isNameSelectMode) return
    const velocityInterval: NodeJS.Timeout = setInterval(() => {
      try {
        const { x, y } = dvd.body.velocity
        if (x > 2e3) return clearInterval(velocityInterval)
        dvd.setVelocity(x * 1.01, y * 1.01)
      } catch {
        clearInterval(velocityInterval)
      }
    }, 200)

    const encroucher: NodeJS.Timeout = setInterval(() => {
      try {
        const { width: gameW, height: gameH } = this.sys.game.canvas
        const [prevWidth, prevHeight] = this.encroachingBoundaryDims
        const [nextWidth, nextHeight] = (this.encroachingBoundaryDims = [
          prevWidth - 0.3,
          prevHeight - 0.3
        ])
        if (nextWidth < this.dvd.width) return clearInterval(encroucher)
        encroachingBoundary.setPosition(
          (gameW - nextWidth) / 2,
          (gameH - nextHeight) / 2
        )
        encroachingBoundary.setSize(...this.encroachingBoundaryDims)
        this.physics.world.bounds.setTo(
          (gameW - nextWidth) / 2,
          (gameH - nextHeight) / 2,
          ...this.encroachingBoundaryDims
        )
      } catch {
        clearInterval(encroucher)
      }
    }, 20)
    const onWorldBounds = () => {
      const wb = this.physics.world.bounds
      const [{ x: dr, y: dt }, { x: dl, y: db }] = [
        dvd.getTopRight(),
        dvd.getBottomRight()
      ]
      const isOnTop = dt - wb.top < 2
      const isOnBottom = wb.bottom - db < 2
      if (!isOnTop && !isOnBottom) return this.onEdgeHit({ scene: this })
      const isOnRight = wb.right - dr < 2
      const isOnLeft = dl - wb.left < 2
      if (!isOnLeft && !isOnRight) return this.onEdgeHit({ scene: this })
      if (isOnRight && isOnTop) {
        this.onCornerHit({ corner: 'TR', scene: this })
      } else if (isOnLeft && isOnTop) {
        this.onCornerHit({ corner: 'TL', scene: this })
      } else if (isOnLeft && isOnBottom) {
        this.onCornerHit({ corner: 'BL', scene: this })
      } else if (isOnRight && isOnBottom) {
        this.onCornerHit({ corner: 'BR', scene: this })
      } else {
        throw new Error('unreachable case')
      }
    }

    const dvdOriginalcheckWorldBounds = (dvd.body as any).checkWorldBounds
    if (!dvdOriginalcheckWorldBounds) {
      throw new Error('missing checkWorldBounds')
    }
    ;(dvd.body as any).checkWorldBounds = function () {
      const isOnBound = dvdOriginalcheckWorldBounds.call(this, arguments)
      if (isOnBound) onWorldBounds()
    }
  }
}
