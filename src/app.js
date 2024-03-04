import * as PIXI from 'pixi.js'
import { createGameState } from './game-state.js'

const game = createGameState()

const app = new PIXI.Application({
  background: '#1099bb',
  resizeTo: window,
})

document.body.appendChild(app.view)

const { pos, border } = game.loop(0)

const middleX = app.screen.width / 2
const middleY = app.screen.height / 2

const bunny = PIXI.Sprite.from('https://pixijs.com/assets/bunny.png')
bunny.anchor.set(0.5, 0.5)
bunny.x = middleX
bunny.y = middleY

const background = new PIXI.Container()

const borderGraphics = new PIXI.Graphics()
borderGraphics.lineStyle(1, '0x000000')
borderGraphics.drawRect(0, 0, border.width, border.height)

background.addChild(borderGraphics)

app.stage.addChild(bunny)
app.stage.addChild(background)

// Listen for animate update
app.ticker.add((delta) => {
  const { pos, spin } = game.loop(delta)
  const middleX = app.screen.width / 2
  const middleY = app.screen.height / 2

  bunny.x = middleX
  bunny.y = middleY

  background.x = middleX + (border.x - pos.x)
  background.y = middleY + (border.y - pos.y)

  if (spin) bunny.rotation += 0.1 * delta
})
