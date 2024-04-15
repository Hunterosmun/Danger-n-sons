import * as PIXI from 'pixi.js'
import * as ecs from '@ksmithut/ecs'
import v from '@ksmithut/ecs/validate'

import { positionComponent, playerControlledComponent } from '../components.js'

export const backgroundSystem = ecs.createSystem(
  v.object({
    background: v.instanceOf(PIXI.Container),
    screen: v.instanceOf(PIXI.Rectangle),
  }),
  { players: [positionComponent, playerControlledComponent] },
  ({ background, screen }, delta, { players }) => {
    const middleX = screen.width / 2
    const middleY = screen.height / 2

    for (const player of players.results) {
      const { x, y } = ecs.getComponent(player, positionComponent)
      background.x = middleX - x
      background.y = middleY - y
    }
  }
)
