import * as ecs from '@ksmithut/ecs'
import v from '@ksmithut/ecs/validate'

import {
  positionComponent,
  playerControlledComponent,
  inventoryComponent,
  possessedByPlayerComponent,
  itemComponent,
} from '../components.js'
import { KEY_BINDINGS } from '../constants.js'

export const interactSystem = ecs.createSystem(
  v.object({
    window: v.instanceOf(Window),
    pressed: v.boolean(),
  }),
  {
    players: [positionComponent, playerControlledComponent, inventoryComponent],
    items: [itemComponent, positionComponent],
  },
  (state, delta, { players, items }) => {
    if (!state.pressed) return
    state.pressed = false
    const playerEntity = Array.from(players.results)[0]
    const player = ecs.getComponent(playerEntity, positionComponent)
    const inventory = ecs.getComponent(playerEntity, inventoryComponent)
    if (inventory.items.length < inventory.maxItems) {
      for (const item of items.results) {
        const pos = ecs.getComponent(item, positionComponent)
        const distance = Math.abs(player.x - pos.x) + Math.abs(player.y - pos.y)
        if (distance < 20) {
          ecs.removeComponent(item, positionComponent)
          inventory.items.push(item)
          ecs.addComponent(item, possessedByPlayerComponent, undefined)
          return
        }
      }
    }
    // Here is where we'll do other interact stuff (like open doors or kick friends)
  },
  (state) => {
    function handleKeyDown(e) {
      if (e.code === KEY_BINDINGS.INTERACT) state.pressed = true
    }
    state.window.addEventListener('keypress', handleKeyDown)
    return () => {
      state.window.removeEventListener('keypress', handleKeyDown)
    }
  }
)
