import * as PIXI from 'pixi.js'
import * as ecs from '@ksmithut/ecs'
import v from '@ksmithut/ecs/validate'

import { positionComponent, graphicsComponent } from '../components.js'

export const graphicsSystem = ecs.createSystem(
  v.object({
    container: v.instanceOf(PIXI.Container),
  }),
  { entities: [positionComponent, graphicsComponent] },
  ({ container }, delta, { entities }) => {
    for (const entity of entities.results) {
      const { x, y } = ecs.getComponent(entity, positionComponent)
      const { pixiObject } = ecs.getComponent(entity, graphicsComponent)
      pixiObject.x = x
      pixiObject.y = y
    }
    for (const entity of entities.added) {
      const { pixiObject } = ecs.getComponent(entity, graphicsComponent)
      container.addChild(pixiObject)
    }
    for (const entity of entities.removed) {
      const { pixiObject } = ecs.getRemovedComponent(entity, graphicsComponent)
      container.removeChild(pixiObject)
    }
  }
)
