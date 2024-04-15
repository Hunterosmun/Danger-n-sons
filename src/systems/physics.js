import * as ecs from '@ksmithut/ecs'
import v from '@ksmithut/ecs/validate'
import { positionComponent, velocityComponent } from '../components.js'

export const physicsSystem = ecs.createSystem(
  v.null(),
  { entities: [positionComponent, velocityComponent] },
  (state, delta, { entities }) => {
    for (const entity of entities.results) {
      const position = ecs.getComponent(entity, positionComponent)
      const velocity = ecs.getComponent(entity, velocityComponent)
      position.x += velocity.x * delta
      position.y += velocity.y * delta
    }
  }
)
