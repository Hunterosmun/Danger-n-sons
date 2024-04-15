import * as PIXI from 'pixi.js'
import * as ecs from '@ksmithut/ecs'

import {
  positionComponent,
  velocityComponent,
  graphicsComponent,
  playerControlledComponent,
  inventoryComponent,
  itemComponent,
} from './components.js'

import { graphicsSystem } from './systems/graphics.js'
import { keyboardInputSystem } from './systems/keyboardInput.js'
import { physicsSystem } from './systems/physics.js'
import { backgroundSystem } from './systems/background.js'
import { interactSystem } from './systems/interact.js'
import { dropSystem } from './systems/drop.js'
import { inventoryGraphicsSystem } from './systems/inventoryGraphics.js'

const app = new PIXI.Application()
await app.init({
  background: '#1099bb',
  resizeTo: window,
})

const inventoryContainer = new PIXI.Container()
const background = new PIXI.Container()
app.stage.addChild(background)
app.stage.addChild(inventoryContainer)
document.body.appendChild(app.canvas)

// const borderGraphics = new PIXI.Graphics()
//   .rect(0, 0, 500, 500)
//   .stroke({ width: 1, color: '#000000' })
// background.addChild(borderGraphics)

const world = ecs
  .createWorld()
  .registerSystem(keyboardInputSystem, {
    down: false,
    up: false,
    left: false,
    right: false,
    running: false,
    window,
  })
  .registerSystem(physicsSystem, null)
  .registerSystem(backgroundSystem, { background, screen: app.screen })
  .registerSystem(interactSystem, { window, pressed: false })
  .registerSystem(dropSystem, { window, drop: false })
  .registerSystem(inventoryGraphicsSystem, { container: inventoryContainer })
  .registerSystem(graphicsSystem, { container: background })

// 4: Create entities

await PIXI.Assets.load([
  { alias: 'bunny', src: 'https://pixijs.com/assets/bunny.png' },
  { alias: 'pizza', src: '/assets/pizza.png' },
])

const player = world.createEntity()
const bunny = PIXI.Sprite.from('bunny')
bunny.anchor.set(0.5)
bunny.zIndex = 1
ecs.addComponent(player, positionComponent, { x: 250, y: 250 })
ecs.addComponent(player, velocityComponent, { x: 0, y: 0 })
ecs.addComponent(player, playerControlledComponent, undefined)
ecs.addComponent(player, graphicsComponent, { pixiObject: bunny })
ecs.addComponent(player, inventoryComponent, { maxItems: 4, items: [] })

function addPizza(x, y) {
  const pizza = world.createEntity()
  const pizzaSprite = PIXI.Sprite.from('pizza')
  pizzaSprite.anchor.set(0.5)
  pizzaSprite.width = 50
  pizzaSprite.height = 50
  ecs.addComponent(pizza, positionComponent, { x, y })
  ecs.addComponent(pizza, itemComponent, undefined)
  ecs.addComponent(pizza, graphicsComponent, { pixiObject: pizzaSprite })
}

addPizza(100, 100)
addPizza(300, 300)
addPizza(100, 300)
addPizza(300, 100)
addPizza(500, 500)

// 5: Start the game loop
app.ticker.add((ticker) => {
  world.execute(ticker.deltaMS / 1000)
})
