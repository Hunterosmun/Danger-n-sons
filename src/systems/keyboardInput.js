import * as ecs from '@ksmithut/ecs'
import v from '@ksmithut/ecs/validate'

import { velocityComponent, playerControlledComponent } from '../components.js'
import { KEY_BINDINGS } from '../constants.js'
export const DIAGONAL_RADIANS = Math.sin(Math.PI / 4)
export const SPEED = 100
export const RUN_MODIFIER = 2

export const keyboardInputSystem = ecs.createSystem(
  v.object({
    up: v.boolean(),
    down: v.boolean(),
    left: v.boolean(),
    right: v.boolean(),
    running: v.boolean(),
    window: v.instanceOf(Window),
  }),
  { entities: [velocityComponent, playerControlledComponent] },
  ({ up, down, left, right, running }, delta, { entities }) => {
    for (const entity of entities.results) {
      const entityVelocity = ecs.getComponent(entity, velocityComponent)

      let velocity = SPEED
      if (running) velocity *= RUN_MODIFIER
      const goinDiagonal = up !== down && left !== right
      if (goinDiagonal) velocity * -DIAGONAL_RADIANS

      entityVelocity.x = 0
      entityVelocity.y = 0
      if (up) entityVelocity.y = -velocity
      if (down) entityVelocity.y = velocity
      if (left) entityVelocity.x = -velocity
      if (right) entityVelocity.x = velocity
    }
  },
  (state) => {
    function handleKeyDown(e) {
      if (e.code === KEY_BINDINGS.MOVE_UP) state.up = true
      if (e.code === KEY_BINDINGS.MOVE_DOWN) state.down = true
      if (e.code === KEY_BINDINGS.MOVE_LEFT) state.left = true
      if (e.code === KEY_BINDINGS.MOVE_RIGHT) state.right = true
      if (e.code === KEY_BINDINGS.RUN) state.running = true
    }
    function handleKeyUp(e) {
      if (e.code === KEY_BINDINGS.MOVE_UP) state.up = false
      if (e.code === KEY_BINDINGS.MOVE_DOWN) state.down = false
      if (e.code === KEY_BINDINGS.MOVE_LEFT) state.left = false
      if (e.code === KEY_BINDINGS.MOVE_RIGHT) state.right = false
      if (e.code === KEY_BINDINGS.RUN) state.running = false
    }
    state.window.addEventListener('keydown', handleKeyDown)
    state.window.addEventListener('keyup', handleKeyUp)
    return () => {
      state.window.removeEventListener('keydown', handleKeyDown)
      state.window.removeEventListener('keyup', handleKeyUp)
    }
  }
)
