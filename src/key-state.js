export function createKeyState() {
  let keys = {}

  function onKeyDown(e) {
    keys[e.code] = true
  }

  function onKeyUp(e) {
    delete keys[e.code]
  }

  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  return {
    get value() {
      return keys
    },
    destroy() {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    },
  }
}
