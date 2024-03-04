import { createKeyState } from './key-state.js'

export function createGameState() {
  const KEY_BINDINGS = {
    MOVE_UP: 'KeyW',
    MOVE_DOWN: 'KeyS',
    MOVE_LEFT: 'KeyA',
    MOVE_RIGHT: 'KeyD',
    RUN: 'ShiftLeft',
    SPIN: 'Space',
  }
  const keyState = createKeyState()
  const SPEED = 2
  const runModifier = 2
  const pos = { x: 0, y: 0 }
  const border = { x: -256, y: -256, width: 512, height: 512 }
  const diagonalRadians = Math.sin(Math.PI / 4)

  return {
    loop(delta) {
      const {
        [KEY_BINDINGS.MOVE_UP]: up,
        [KEY_BINDINGS.MOVE_DOWN]: down,
        [KEY_BINDINGS.MOVE_LEFT]: left,
        [KEY_BINDINGS.MOVE_RIGHT]: right,
        [KEY_BINDINGS.RUN]: running,
        [KEY_BINDINGS.SPIN]: spin,
      } = keyState.value

      // Move position
      let distance = SPEED * delta
      if (running) distance += runModifier
      const goinDiagonal = up !== down && left !== right
      if (goinDiagonal) distance *= diagonalRadians

      if (up) pos.y -= distance
      if (down) pos.y += distance
      if (left) pos.x -= distance
      if (right) pos.x += distance

      // Border collision
      pos.x = clamp(pos.x, border.x, border.x + border.width)
      pos.y = clamp(pos.y, border.y, border.y + border.height)

      return { pos, border, spin }
    },
  }
}

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max)
}
