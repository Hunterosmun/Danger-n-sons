import * as PIXI from 'pixi.js'
import * as ecs from '@ksmithut/ecs'
import v from '@ksmithut/ecs/validate'

// 1: Create components
const positionComponent = ecs.createComponent(
  v.object({
    x: v.number(),
    y: v.number(),
  })
)

const velocityComponent = ecs.createComponent(
  v.object({
    x: v.number(),
    y: v.number(),
  })
)

const playerControlledComponent = ecs.createComponent(v.undefined())

const graphicsComponent = ecs.createComponent(
  v.object({
    pixiObject: v.or(v.instanceOf(PIXI.Graphics), v.instanceOf(PIXI.Sprite)),
  })
)

// 2: Create systems
const graphicsSystem = ecs.createSystem(
  v.object({
    container: v.instanceOf(PIXI.Container),
  }),
  { entities: [positionComponent, graphicsComponent] },
  ({ container }, delta, { entities }) => {
    for (const entity of entities) {
      const { x, y } = ecs.getComponent(entity, positionComponent)
      const { pixiObject } = ecs.getComponent(entity, graphicsComponent)
      pixiObject.x = x
      pixiObject.y = y
      if (ecs.isAdded(entities, entity)) container.addChild(pixiObject)
      if (ecs.isRemoved(entities, entity)) pixiObject.removeFromParent()
    }
  }
)

const DIAGONAL_RADIANS = Math.sin(Math.PI / 4)
const SPEED = 100
const RUN_MODIFIER = 2
const KEY_BINDINGS = {
  MOVE_UP: 'KeyW',
  MOVE_DOWN: 'KeyS',
  MOVE_LEFT: 'KeyA',
  MOVE_RIGHT: 'KeyD',
  RUN: 'ShiftLeft',
  SPIN: 'Space',
  INTERACT: 'KeyE',
}

const keyboardInputSystem = ecs.createSystem(
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
    for (const entity of entities) {
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

const physicsSystem = ecs.createSystem(
  v.null(),
  { entities: [positionComponent, velocityComponent] },
  (state, delta, { entities }) => {
    for (const entity of entities) {
      const position = ecs.getComponent(entity, positionComponent)
      const { x: x, y: y } = ecs.getComponent(entity, velocityComponent)
      position.x += x * delta
      position.y += y * delta
    }
  }
)

const backgroundSystem = ecs.createSystem(
  v.object({
    background: v.instanceOf(PIXI.Container),
    screen: v.instanceOf(PIXI.Rectangle),
  }),
  { players: [positionComponent, playerControlledComponent] },
  ({ background, screen }, delta, { players }) => {
    const middleX = screen.width / 2
    const middleY = screen.height / 2

    for (const player of players) {
      const { x, y } = ecs.getComponent(player, positionComponent)
      background.x = middleX - x
      background.y = middleY - y
    }
  }
)

// 3: Create world
const app = new PIXI.Application()
await app.init({
  background: '#1099bb',
  resizeTo: window,
})

const background = new PIXI.Container()
app.stage.addChild(background)
document.body.appendChild(app.canvas)

const borderGraphics = new PIXI.Graphics()
  .rect(0, 0, 500, 500)
  .stroke({ width: 1, color: '#000000' })
background.addChild(borderGraphics)

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
  .registerSystem(graphicsSystem, { container: background })

// 4: Create entities

const bunnyURL = 'https://pixijs.com/assets/bunny.png'
const bunnyTexture = await PIXI.Assets.load(bunnyURL)
const bunny = PIXI.Sprite.from(bunnyTexture)

const player = world.createEntity()
ecs.addComponent(player, positionComponent, { x: 250, y: 250 })
ecs.addComponent(player, velocityComponent, { x: 0, y: 0 })
ecs.addComponent(player, playerControlledComponent, undefined)
ecs.addComponent(player, graphicsComponent, { pixiObject: bunny })

// 5: Start the game loop
app.ticker.add((ticker) => {
  world.execute(ticker.deltaMS / 1000)
})
