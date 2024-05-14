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
      const movementAnimation = ecs.getComponent(
        entity,
        movementAnimationComponent
      )
      const graphics = ecs.getComponent(entity, graphicsComponent)
      if (velocity.x < 0) {
        // left
        if (graphics.pixiObject.textures !== movementAnimation.left) {
          graphics.pixiObject.textures = movementAnimation.left
          graphics.pixiObject.animationSpeed = movementAnimation.animationSpeed
          graphics.pixiObject.play()
        }
      } else if (velocity.x > 0) {
        // right
        if (graphics.pixiObject.textures !== movementAnimation.right) {
          graphics.pixiObject.textures = movementAnimation.right
          graphics.pixiObject.animationSpeed = movementAnimation.animationSpeed
          graphics.pixiObject.play()
        }
      } else if (velocity.y < 0) {
        // up
        if (graphics.pixiObject.textures !== movementAnimation.up) {
          graphics.pixiObject.textures = movementAnimation.up
          graphics.pixiObject.animationSpeed = movementAnimation.animationSpeed
          graphics.pixiObject.play()
        }
      } else if (velocity.y > 0) {
        // down
        if (graphics.pixiObject.textures !== movementAnimation.down) {
          graphics.pixiObject.textures = movementAnimation.down
          graphics.pixiObject.animationSpeed = movementAnimation.animationSpeed

          graphics.pixiObject.play()
        }
      } else if (graphics.pixiObject.textures !== movementAnimation.stopped) {
        // stopped
        graphics.pixiObject.textures = movementAnimation.stopped
        graphics.pixiObject.animationSpeed =
          movementAnimation.animationSpeed / 6

        graphics.pixiObject.play()
      }
    }
  }
)
