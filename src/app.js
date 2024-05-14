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
  movementAnimationComponent,
} from './components.js'

import { graphicsSystem } from './systems/graphics.js'
import { keyboardInputSystem } from './systems/keyboardInput.js'
import { physicsSystem } from './systems/physics.js'
import { backgroundSystem } from './systems/background.js'
import { interactSystem } from './systems/interact.js'
import { dropSystem } from './systems/drop.js'
import { inventoryGraphicsSystem } from './systems/inventoryGraphics.js'
import { playerAnimationSystem } from './systems/playerAnimation.js'

const app = new PIXI.Application()
await app.init({
  background: '#1099bb',
  resizeTo: window,
})

await PIXI.Assets.load([
  // { alias: 'bunny', src: 'https://pixijs.com/assets/bunny.png' },
  { alias: 'bunny', src: '/assets/bunnyFrames.png' },
  { alias: 'pizza', src: '/assets/pizza.png' },
])

const bunnyData = {
  frames: {
    up1: { frame: { x: 0, y: 0, w: 24, h: 32 } },
    up2: { frame: { x: 24, y: 0, w: 24, h: 32 } },
    up3: { frame: { x: 48, y: 0, w: 24, h: 32 } },
    right1: { frame: { x: 0, y: 32, w: 24, h: 32 } },
    right2: { frame: { x: 24, y: 32, w: 24, h: 32 } },
    right3: { frame: { x: 48, y: 32, w: 24, h: 32 } },
    down1: { frame: { x: 0, y: 64, w: 24, h: 32 } },
    down2: { frame: { x: 24, y: 64, w: 24, h: 32 } },
    down3: { frame: { x: 48, y: 64, w: 24, h: 32 } },
    left1: { frame: { x: 0, y: 96, w: 24, h: 32 } },
    left2: { frame: { x: 24, y: 96, w: 24, h: 32 } },
    left3: { frame: { x: 48, y: 96, w: 24, h: 32 } },
  },
  meta: {
    image: 'bunny',
    format: 'RGBA8888',
    size: { w: 72, h: 128 },
    scale: 1,
  },
  animations: {
    up: ['up1', 'up2', 'up3', 'up2'],
    right: ['right1', 'right2', 'right3', 'right2'],
    down: ['down1', 'down2', 'down3', 'down2'],
    left: ['left1', 'left2', 'left3', 'left2'],
    stopped: ['down2', 'right2', 'up2', 'left2'],
  },
}

const spritesheet = new PIXI.Spritesheet(
  PIXI.Texture.from(bunnyData.meta.image),
  bunnyData
)
await spritesheet.parse()

const inventoryContainer = new PIXI.Container()
const background = new PIXI.Container()
app.stage.addChild(background)
app.stage.addChild(inventoryContainer)
document.body.appendChild(app.canvas)

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
  .registerSystem(interactSystem, { window, interact: false, kicking: false })
  .registerSystem(dropSystem, { window, drop: false })
  .registerSystem(inventoryGraphicsSystem, { container: inventoryContainer })
  .registerSystem(playerAnimationSystem, null)
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
1  2     111111111111111  1
11 9   2                  1
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

initMap(grid)

function addPlayer(x, y) {
  const player = world.createEntity()

  const playerSprite = new PIXI.AnimatedSprite(spritesheet.animations.down)
  playerSprite.animationSpeed = 0.1
  playerSprite.play()
  playerSprite.anchor.set(0.5)
  playerSprite.zIndex = 1

  ecs.addComponent(player, positionComponent, { x, y })
  ecs.addComponent(player, velocityComponent, { x: 0, y: 0 })
  ecs.addComponent(player, playerControlledComponent, undefined)
  ecs.addComponent(player, graphicsComponent, { pixiObject: playerSprite })
  ecs.addComponent(player, inventoryComponent, { maxItems: 4, items: [] })
  ecs.addComponent(player, movementAnimationComponent, {
    up: spritesheet.animations.up,
    down: spritesheet.animations.down,
    left: spritesheet.animations.left,
    right: spritesheet.animations.right,
    stopped: spritesheet.animations.stopped,
    animationSpeed: 0.1,
  })
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
