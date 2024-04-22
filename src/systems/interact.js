import * as ecs from '@ksmithut/ecs'
import v from '@ksmithut/ecs/validate'

import {
  positionComponent,
  playerControlledComponent,
  inventoryComponent,
  possessedByPlayerComponent,
  itemComponent,
  velocityComponent,
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
          ecs.removeComponent(item, velocityComponent)
          inventory.items.push(item)
          ecs.addComponent(item, possessedByPlayerComponent, undefined)
          return
        }
      }
    } else {
      for (const item of items.results) {
        const pos = ecs.getComponent(item, positionComponent)
        const xDist = pos.x - player.x
        const yDist = pos.y - player.y
        const distance = Math.abs(xDist) + Math.abs(yDist)
        const PROXIMITY = 40
        const MAX_KICKING_SPEED = 100
        const KICKING_SPEED =
          MAX_KICKING_SPEED - MAX_KICKING_SPEED * (distance / PROXIMITY)
        if (distance < PROXIMITY) {
          const h = Math.sqrt(xDist ** 2 + yDist ** 2)
          const ratio = KICKING_SPEED / h
          const x = xDist * ratio
          const y = yDist * ratio
          ecs.addComponent(item, velocityComponent, { x, y })
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
