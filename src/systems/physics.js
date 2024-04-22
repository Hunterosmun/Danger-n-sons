import * as ecs from '@ksmithut/ecs'
import v from '@ksmithut/ecs/validate'
import {
  positionComponent,
  velocityComponent,
  frictionComponent,
} from '../components.js'

export const physicsSystem = ecs.createSystem(
  v.null(),
  { entities: [positionComponent, velocityComponent] },
  (state, delta, { entities }) => {
    for (const entity of entities.results) {
      const position = ecs.getComponent(entity, positionComponent)
      const velocity = ecs.getComponent(entity, velocityComponent)
      position.x += velocity.x * delta
      position.y += velocity.y * delta
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
