let cnv
let tetromino
let arena
let scale = 30

function setup() {
  cnv = createCanvas(19.5 * scale + 1, 20 * scale + 1)
  resetGame()
  textAlign(CENTER)
}

function draw() {
  background(200)
  arena.draw(0, 0)
  if (!arena.gameOver) {
    arena.update()
  } else {
    showGameOverText()
  }
}

function showGameOverText() {
  fill(0)
  textSize(scale * 2.5)
  text("GAME OVER", width / 2, 0.15 * height)
  textSize(scale * 1)
  text('Press "R" to play again', width / 2, 0.27 * height)
}

function resetGame() {
  arena = new Arena()
}

function getColor(number) {
  switch (number) {
    case 1:
      return [68, 175, 247]
      break;
    case 2:
      return [34, 89, 222]
      break;
    case 3:
      return [237, 119, 51]
      break;
    case 4:
      return [246, 181, 50]
      break;
    case 5:
      return [104, 199, 18]
      break;
    case 6:
      return [198, 69, 166]
      break;
    case 7:
      return [233, 63, 52]
      break;
    default:
      return undefined
      break;
  }
}
