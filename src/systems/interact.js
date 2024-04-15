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
        const xDist = player.x - pos.x
        const yDist = player.y - pos.y
        const distance = Math.abs(xDist) + Math.abs(yDist)
        const KICKING_SPEED = 50
        const PROXIMITY = 20
        if (distance < PROXIMITY) {
          const xSpeed = (xDist / PROXIMITY) * KICKING_SPEED + KICKING_SPEED
          const ySpeed = (yDist / PROXIMITY) * KICKING_SPEED + KICKING_SPEED
          ecs.addComponent(item, velocityComponent, {
            x: xDist < 0 ? xSpeed : -xSpeed,
            y: yDist < 0 ? ySpeed : -ySpeed,
          })
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
