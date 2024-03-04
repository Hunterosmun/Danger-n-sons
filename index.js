// To start up the game: `python3 -m http.server` and go to `http://localhost:8000`

const canvas = document.getElementById("canvas'n'sons")
if (!(canvas instanceof HTMLCanvasElement)) throw new Error('Canvas not found')

const ctx = canvas.getContext('2d')

const pos = { x: 8, y: 8 }
const size = 32
const radius = size / 2
// const speed = 128
const speed = 256

const border = {
  // x: -256,
  // y: -256,
  // width: 512,
  // height: 512,
  x: -512,
  y: -512,
  width: 1024,
  height: 1024,
}

const keyState = {
  up: false,
  down: false,
  left: false,
  right: false,
  running: false,
}

function resizeCanvas() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

window.addEventListener('resize', () => resizeCanvas(canvas))
resizeCanvas()

// for moving in a straight line
function getAxisDistance(timeDelta) {
  return keyState.running ? speed * timeDelta * 2 : speed * timeDelta
}
// for moving diganolly
function getDiagonalDistance(timeDelta) {
  // gonna need some SohCahToa for this one
  // Math.PI / 4 is the same as 45 degrees
  return getAxisDistance(timeDelta) * Math.sin(Math.PI / 4)
}

function move(timeDelta) {
  const goinDiagonal =
    keyState.up !== keyState.down && keyState.left !== keyState.right

  const localSpeed = goinDiagonal
    ? getDiagonalDistance(timeDelta)
    : getAxisDistance(timeDelta)

  if (keyState.up) pos.y -= localSpeed
  if (keyState.down) pos.y += localSpeed
  if (keyState.left) pos.x -= localSpeed
  if (keyState.right) pos.x += localSpeed
}

function draw(delta) {
  if (!canvas) return

  const middle = {
    x: Math.round(canvas.clientWidth / 2),
    y: Math.round(canvas.clientHeight / 2),
  }

  move(delta)
  // Border Collision
  pos.x = Math.min(
    Math.max(pos.x, border.x + radius),
    border.x + border.width - radius
  )
  pos.y = Math.min(
    Math.max(pos.y, border.y + radius),
    border.y + border.height - radius
  )

  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
  // Draw player
  fillCircle(
    Math.round(middle.x),
    Math.round(middle.y),
    Math.round(radius),
    'gray'
  )
  // Draw border
  ctx.strokeStyle = 'black'
  ctx.strokeRect(
    Math.round(middle.x + (border.x - pos.x)),
    Math.round(middle.y + (border.y - pos.y)),
    border.width,
    border.height
  )
}

function fillCircle(x, y, radius, color) {
  // ctx.beginPath()
  ctx.arc(x, y, radius, 0, 2 * Math.PI)
  ctx.fillStyle = color
  ctx.fill()
}

let lastRender = Date.now()
// this way of doing render should run at roughly 60fps
const render = () => {
  const now = Date.now()
  const delta = now - lastRender
  lastRender = now
  draw(delta / 1000)
  window.requestAnimationFrame(render)
}
render()

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
