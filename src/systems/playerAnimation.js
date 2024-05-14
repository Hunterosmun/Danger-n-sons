import * as ecs from '@ksmithut/ecs'
import v from '@ksmithut/ecs/validate'
import {
  graphicsComponent,
  velocityComponent,
  movementAnimationComponent,
} from '../components.js'

export const playerAnimationSystem = ecs.createSystem(
  v.null(),
  {
    entities: [
      graphicsComponent,
      velocityComponent,
      movementAnimationComponent,
    ],
  },
  (state, delta, { entities }) => {
    for (const entity of entities.results) {
      const velocity = ecs.getComponent(entity, velocityComponent)
      const { up, down, left, right } = ecs.getComponent(
        entity,
        movementAnimationComponent
      )
      const { pixiObject } = ecs.getComponent(entity, graphicsComponent)
      if (velocity.x < 0) {
        // left
        if (pixiObject.textures !== left) pixiObject.textures = left
        pixiObject.play()
      } else if (velocity.x > 0) {
        // right
        if (pixiObject.textures !== right) pixiObject.textures = right
        pixiObject.play()
      } else if (velocity.y < 0) {
        // up
        if (pixiObject.textures !== up) pixiObject.textures = up
        pixiObject.play()
      } else if (velocity.y > 0) {
        // down
        if (pixiObject.textures !== down) pixiObject.textures = down
        pixiObject.play()
      } else {
        // stopped
        pixiObject.stop()
      }
    }
  }
)
