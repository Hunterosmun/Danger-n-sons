import * as PIXI from 'pixi.js'
import * as ecs from '@ksmithut/ecs'
import v from '@ksmithut/ecs/validate'

import {
  itemComponent,
  graphicsComponent,
  possessedByPlayerComponent,
} from '../components.js'

export const inventoryGraphicsSystem = ecs.createSystem(
  v.object({ container: v.instanceOf(PIXI.Container) }),
  { items: [itemComponent, graphicsComponent, possessedByPlayerComponent] },
  ({ container }, delta, { items }) => {
    for (const item of items.added) {
      const { pixiObject } = ecs.getComponent(item, graphicsComponent)
      container.addChild(pixiObject)
    }
    let offset = 40
    for (const item of items.results) {
      const { pixiObject } = ecs.getComponent(item, graphicsComponent)
      pixiObject.x = 40
      pixiObject.y = offset += 40
    }
    for (const item of items.removed) {
      const { pixiObject } = ecs.getRemovedComponent(item, graphicsComponent)
      container.removeChild(pixiObject)
    }
  }
)
