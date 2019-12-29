let currentlyPressed = {}

function keyPressed() {
  if (!arena.gameOver) {
    switch (keyCode) {
      case 67:
        arena.holdTetromino()
        break;
      case 88:
        arena.rotateTetromino(true)
        break;
      case 90:
        arena.rotateTetromino(false)
        break;
      case 32:
        arena.dropTetromino()
        break;
      case 37:
        arena.moveHorisontally(-1)
        break;
      case 39:
        arena.moveHorisontally(1)
        break;
    }
    // console.log(keyCode)
    currentlyPressed[keyCode] = millis()
  }
  if (keyCode == 82) {
    resetGame()
  }
}

function keyReleased() {
  delete currentlyPressed[keyCode]
}
