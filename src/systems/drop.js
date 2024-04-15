import * as ecs from '@ksmithut/ecs'
import v from '@ksmithut/ecs/validate'

import {
  positionComponent,
  playerControlledComponent,
  inventoryComponent,
  possessedByPlayerComponent,
} from '../components.js'
import { KEY_BINDINGS } from '../constants.js'

export const dropSystem = ecs.createSystem(
  v.object({
    window: v.instanceOf(Window),
    pressed: v.boolean(),
  }),
  {
    players: [positionComponent, playerControlledComponent, inventoryComponent],
  },
  (state, delta, { players }) => {
    if (!state.drop) return
    state.drop = false
    const playerEntity = Array.from(players.results)[0]
    const player = ecs.getComponent(playerEntity, positionComponent)
    const inventory = ecs.getComponent(playerEntity, inventoryComponent)
    if (inventory.items.length) {
      const item = inventory.items.pop()
      ecs.addComponent(item, positionComponent, { x: player.x, y: player.y })
      ecs.removeComponent(item, possessedByPlayerComponent)
    }
  },
  (state) => {
    function handleKeyDown(e) {
      if (e.code === KEY_BINDINGS.DROP) state.drop = true
    }
    state.window.addEventListener('keypress', handleKeyDown)
    return () => {
      state.window.removeEventListener('keypress', handleKeyDown)
    }
  }
)
