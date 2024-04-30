import * as PIXI from 'pixi.js'
import * as ecs from '@ksmithut/ecs'

import {
  positionComponent,
  velocityComponent,
  graphicsComponent,
  playerControlledComponent,
  inventoryComponent,
  itemComponent,
  collidableComponent,
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

// 3.5: Map!

/*
  1: Wall
  2: Pizza
  9: Player
  */
const grid = `
1111111111
12   12121
11    2  1
19 2     111111111111111  1
11     2                  1
12                        1
11   2   1111111  111111111
12     2 1     1     21
11      21     1   1  1
12   12121     1   1  1
1111111111     1  21  1
               12  2  1
    111111111111 111111
    122          1     
    12221111111111     
    12221              
    11111                
  `

function initMap(grid) {
  const cellWidth = 50
  const middleWidth = Math.floor(cellWidth / 2)
  function topLeft(x, y) {
    return { x: x * cellWidth, y: y * cellWidth }
  }
  function middle(x, y) {
    const pos = topLeft(x, y)
    return { x: pos.x + middleWidth, y: pos.y + middleWidth }
  }

  function random(x, y, padding) {
    const rand = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)
    const pos = topLeft(x, y)
    const minX = pos.x + padding
    const maxX = pos.x + cellWidth - padding
    const minY = pos.y + padding
    const maxY = pos.y + cellWidth - padding
    return { x: rand(minX, maxX), y: rand(minY, maxY) }
  }

  grid
    .trim()
    .split('\n')
    .forEach((line, y) => {
      return line.split('').map((cell, x) => {
        switch (cell) {
          case '1': {
            const pos = topLeft(x, y)
            addWall(pos.x, pos.y, cellWidth, cellWidth)
            break
          }
          case '2': {
            const pos = random(x, y, 15)
            addPizza(pos.x, pos.y)
            break
          }
          case '9': {
            const pos = middle(x, y)
            addPlayer(pos.x, pos.y)
            break
          }
        }
      })
    })
}

// 4: Create entities

await PIXI.Assets.load([
  { alias: 'bunny', src: 'https://pixijs.com/assets/bunny.png' },
  { alias: 'pizza', src: '/assets/pizza.png' },
])
initMap(grid)

function addPlayer(x, y) {
  const player = world.createEntity()
  const bunny = PIXI.Sprite.from('bunny')
  bunny.anchor.set(0.5)
  bunny.zIndex = 1
  ecs.addComponent(player, positionComponent, { x, y })
  ecs.addComponent(player, velocityComponent, { x: 0, y: 0 })
  ecs.addComponent(player, playerControlledComponent, undefined)
  ecs.addComponent(player, graphicsComponent, { pixiObject: bunny })
  ecs.addComponent(player, inventoryComponent, { maxItems: 4, items: [] })
}

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

function addWall(x, y, w, h) {
  const wall = world.createEntity()
  const wallGraphics = new PIXI.Graphics().rect(0, 0, w, h).fill(0x555555)
  ecs.addComponent(wall, positionComponent, { x, y })
  ecs.addComponent(wall, graphicsComponent, { pixiObject: wallGraphics })
  ecs.addComponent(wall, collidableComponent, undefined)
}

// 5: Start the game loop
app.ticker.add((ticker) => {
  world.execute(ticker.deltaMS / 1000)
})
