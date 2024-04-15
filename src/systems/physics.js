import * as ecs from '@ksmithut/ecs'
import v from '@ksmithut/ecs/validate'
import { positionComponent, velocityComponent } from '../components.js'

export const physicsSystem = ecs.createSystem(
  v.null(),
  { entities: [positionComponent, velocityComponent] },
  (state, delta, { entities }) => {
    for (const entity of entities.results) {
      const position = ecs.getComponent(entity, positionComponent)
      const { x: x, y: y } = ecs.getComponent(entity, velocityComponent)
      position.x += x * delta
      position.y += y * delta
    }
  }
)
