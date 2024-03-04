const canvas = document.getElementById("canvas'n'sons")
if (!(canvas instanceof HTMLCanvasElement)) throw new Error('Canvas not found')

function resizeCanvas() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  drawGrid()
}

window.addEventListener('resize', () => resizeCanvas(canvas))
resizeCanvas()

function drawGrid() {
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = 'black'
  for (let i = 0; i < window.innerHeight; i += 32) {
    ctx.fillRect(0, i, window.innerWidth, 1)
  }
  for (let i = 0; i < window.innerWidth; i += 32) {
    ctx.fillRect(i, 0, 1, window.innerHeight)
  }
}

const pos = { x: 8, y: 8 }
const size = 32
const speed = 4
const keyState = {
  up: false,
  down: false,
  left: false,
  right: false,
  running: false,
}

setInterval(() => {
  window.requestAnimationFrame(() => {
    let delta = speed
    if (keyState.running) delta += 4
    if (keyState.up) pos.y -= delta
    if (keyState.down) pos.y += delta
    if (keyState.left) pos.x -= delta
    if (keyState.right) pos.x += delta
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = 'black'
    ctx.fillRect(pos.x, pos.y, size, size)
  })
}, 1000 / 60)

window.addEventListener('keydown', (e) => {
  switch (e.code) {
    case 'KeyW': {
      keyState.up = true
      break
    }
    case 'KeyS': {
      keyState.down = true
      break
    }
    case 'KeyA': {
      keyState.left = true
      break
    }
    case 'KeyD': {
      keyState.right = true
      break
    }
    case 'ShiftLeft': {
      keyState.running = true
      break
    }
  }
})

window.addEventListener('keyup', (e) => {
  switch (e.code) {
    case 'KeyW': {
      keyState.up = false
      break
    }
    case 'KeyS': {
      keyState.down = false
      break
    }
    case 'KeyA': {
      keyState.left = false
      break
    }
    case 'KeyD': {
      keyState.right = false
      break
    }
    case 'ShiftLeft': {
      keyState.running = false
      break
    }
  }
})
