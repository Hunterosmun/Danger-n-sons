import * as ecs from '@ksmithut/ecs'
import v from '@ksmithut/ecs/validate'
import {
  positionComponent,
  velocityComponent,
  frictionComponent,
  graphicsComponent,
  collidableComponent,
} from '../components.js'

export const physicsSystem = ecs.createSystem(
  v.null(),
  {
    entities: [graphicsComponent, positionComponent, velocityComponent],
    collidables: [collidableComponent, graphicsComponent],
  },
  (state, delta, { entities, collidables }) => {
    for (const entity of entities.results) {
      const position = ecs.getComponent(entity, positionComponent)
      const velocity = ecs.getComponent(entity, velocityComponent)
      const xDist = velocity.x * delta
      const yDist = velocity.y * delta
      if (xDist !== 0 || yDist !== 0) {
        const { pixiObject } = ecs.getComponent(entity, graphicsComponent)
        const bounds = pixiObject.getBounds()
        bounds.x = bounds.x + xDist
        bounds.y = bounds.y + yDist
        for (const collidable of collidables.results) {
          const { pixiObject: collidablePixiObject } = ecs.getComponent(
            collidable,
            graphicsComponent
          )
          const collidableBounds = collidablePixiObject.getBounds()

          if (checkCollision(bounds, collidableBounds)) return
        }
      }
      position.x += xDist
      position.y += yDist
      if (ecs.hasComponent(entity, frictionComponent)) {
        const f = ecs.getComponent(entity, frictionComponent)
        if (velocity.x < 0) {
          velocity.x = Math.min(0, velocity.x + f)
        } else {
          velocity.x = Math.max(0, velocity.x - f)
        }
        if (velocity.y < 0) {
          velocity.y = Math.min(0, velocity.y + f)
        } else {
          velocity.y = Math.max(0, velocity.y - f)
        }
      }
    }
  }
)

function checkCollision(bounds1, bounds2) {
  return (
    bounds1.x < bounds2.x + bounds2.width &&
    bounds1.x + bounds1.width > bounds2.x &&
    bounds1.y < bounds2.y + bounds2.height &&
    bounds1.y + bounds1.height > bounds2.y
  )
}
