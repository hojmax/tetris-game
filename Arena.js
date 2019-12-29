class Arena {
  constructor() {
    // Player Options
    this.maxGoofing = 25
    this.gravityFrequency = 800
    this.verticalIncrementFrequency = 20
    this.horisontalIncrementDelay = 200
    this.horisontalIncrementFrequency = 40
    // Setup
    this.grid = Arena.emptyGrid()
    this.tetrominoQueue = []
    this.typeQueue = []
    this.holdCell = undefined
    this.hasSwappedTetromino = false
    this.score = 0
    this.fillTetrominoQueue()
    this.gameOver = false
    this.lastTimeGravity = millis()
    this.goofingCount = 0
    this.placementTimeCounter = millis()
  }
  draw(x, y) {
    this.drawLines(x, y)
    this.drawGrid(x, y)
    this.drawGhost(x, y)
    this.currentTetromino.draw(x + 4.5, y)
    this.drawQueue(x, y)
    this.drawHold(x, y)
  }
  update() {
    this.handleRepeatedButtons()
    this.handleGravity()
  }
  handleGravity() {
    this.currentTetromino.y++
    let placementPhase = this.isColliding(this.currentTetromino)
    this.currentTetromino.y--
    if (placementPhase &&
      millis() - this.placementTimeCounter >= this.gravityFrequency) {
      this.solidify(this.currentTetromino)
    }
    if (millis() - this.lastTimeGravity >= this.gravityFrequency) {
      this.lastTimeGravity += this.gravityFrequency
      this.currentTetromino.y++
      if (this.isColliding(this.currentTetromino)) {
        this.currentTetromino.y--
      } else {
        this.placementTimeCounter = millis()
      }
    }
  }
  get currentTetromino() {
    return this.tetrominoQueue[0]
  }
  static emptyGrid() {
    let output = []
    for (let i = 0; i < 20; i++) {
      output.push([])
      for (let j = 0; j < 10; j++) {
        output[i].push(0)
      }
    }
    return output
  }
  fillTetrominoQueue() {
    while (this.tetrominoQueue.length < 7) {
      if (this.typeQueue.length == 0) {
        this.fillTypeQueue()
      }
      this.tetrominoQueue.push(new Tetromino(this.typeQueue[0]))
      this.typeQueue.splice(0, 1)
    }
  }
  fillTypeQueue() {
    let array = [1, 2, 3, 4, 5, 6, 7]
    let newTypeQueue = []
    while (array.length > 0) {
      let index = Math.floor(Math.random() * array.length)
      newTypeQueue.push(array[index])
      array.splice(index, 1)
    }
    this.typeQueue = newTypeQueue
  }
  tetrominoToGrid(tetromino) {
    for (let [i, array] of tetromino.matrix.entries()) {
      for (let [j, element] of array.entries()) {
        if (element != 0) {
          this.grid[tetromino.y + i][tetromino.x + j] += element
        }
      }
    }
  }
  drawLines(x, y) {
    push()
    stroke(0, 0, 0, 70)
    for (let i = 0; i < 21; i++) {
      line((x + 4.5) * scale, (y + i) * scale, (x + 14.5) * scale, (y + i) * scale)
    }
    for (let j = 0; j < 11; j++) {
      line((x + 4.5 + j) * scale, y * scale, (x + 4.5 + j) * scale, (y + 20) * scale)
    }
    pop()
  }
  drawGrid(x, y) {
    for (let [i, array] of this.grid.entries()) {
      for (let [j, element] of array.entries()) {
        if (element != 0) {
          push()
          noStroke()
          fill(getColor(element))
          rect((j + (x + 4.5)) * scale, (i + y) * scale, scale, scale)
          pop()
        }
      }
    }
  }
  drawGhost(x, y) {
    let holdY = this.currentTetromino.y
    while (!this.isColliding(this.currentTetromino)) {
      this.currentTetromino.y++
    }
    this.currentTetromino.y--
    push()
    noStroke()
    this.currentTetromino.drawAsGhost(x + 4.5, y)
    pop()
    this.currentTetromino.y = holdY
  }
  isColliding(tetromino) {
    for (let [i, array] of tetromino.matrix.entries()) {
      for (let [j, element] of array.entries()) {
        if (element != 0) {
          let y = i + tetromino.y
          let x = j + tetromino.x
          if (x < 0 || x >= 10 || y >= 20 || (y >= 0 && this.grid[y][x] != 0)) {
            return true
          }
        }
      }
    }
    return false
  }
  holdTetromino() {
    if (!this.hasSwappedTetromino) {
      let holder = this.tetrominoQueue[0]
      if (this.holdCell != undefined) {
        this.tetrominoQueue[0] = this.holdCell
      } else {
        this.tetrominoQueue.splice(0, 1)
      }
      this.holdCell = holder
      this.holdCell.reset()
      this.hasSwappedTetromino = true
    }
  }
  rotateTetromino(clockwise) {
    this.currentTetromino.rotateMatrix(clockwise)
    this.handleRotationalCollision(clockwise)
    this.handleGoofing()
  }
  handleRotationalCollision(clockwise) {
    if (this.isColliding(this.currentTetromino)) {
      let movementOptions = [{
          "x": 1,
          "y": 0
        },
        {
          "x": 0,
          "y": -1
        },
        {
          "x": 1,
          "y": 1
        },
        {
          "x": 2,
          "y": 0
        },
        {
          "x": 0,
          "y": 2
        },
        {
          "x": 0,
          "y": -2
        },
        {
          "x": 1,
          "y": -2
        }
      ]
      let hasFoundOption = false
      for (let movement of movementOptions) {
        if (this.checkRotationMovement(movement)) {
          hasFoundOption = true
          break
        } else {
          movement.x *= -1
          if (this.checkRotationMovement(movement)) {
            hasFoundOption = true
            break
          }
        }
      }
      if (!hasFoundOption) {
        this.rotateTetromino(!clockwise)
      }
    }
  }
  checkRotationMovement(movement) {
    this.currentTetromino.x += movement.x
    this.currentTetromino.y += movement.y
    if (this.isColliding(this.currentTetromino)) {
      this.currentTetromino.x -= movement.x
      this.currentTetromino.y -= movement.y
      return false
    } else {
      return true
    }
  }
  dropTetromino() {
    while (!this.isColliding(this.currentTetromino)) {
      this.currentTetromino.y++
    }
    this.currentTetromino.y--
    this.solidify(this.currentTetromino)
  }
  solidify(tetromino) {
    console.log(millis())
    if (!this.isGameOver(tetromino)) {
      this.tetrominoToGrid(tetromino)
      this.tetrominoQueue.splice(0, 1)
      this.correctTetrominoStartingPosition()
      this.clearFilledRows()
      this.hasSwappedTetromino = false
      this.goofingCount = 0
      this.lastTimeGravity = millis()
      this.placementTimeCounter = millis()
      this.fillTetrominoQueue()
    } else {
      this.gameOver = true
    }
  }
  isGameOver() {
    for (let [i, array] of this.currentTetromino.matrix.entries()) {
      for (let [j, element] of array.entries()) {
        let y = i + this.currentTetromino.y
        if (element != 0 && y < 0) {
          return true
        }
      }
    }
    return false
  }
  handleGoofing() {
    this.goofingCount++
    if (this.goofingCount < this.maxGoofing) {
      this.placementTimeCounter = millis()
    }
  }
  moveHorisontally(direction) {
    this.currentTetromino.x += direction
    if (this.isColliding(this.currentTetromino)) {
      this.currentTetromino.x -= direction
    }
    this.handleGoofing()
  }
  moveVerticallyRepeated() {
    if (currentlyPressed[40] != undefined) {
      while (millis() - currentlyPressed[40] >= this.verticalIncrementFrequency) {
        currentlyPressed[40] += this.verticalIncrementFrequency
        this.currentTetromino.y++
        if (this.isColliding(this.currentTetromino)) {
          this.currentTetromino.y--
          currentlyPressed[40] = millis()
          break
        } else {
          this.lastTimeGravity = millis()
          this.placementTimeCounter = millis() - this.gravityFrequency / 2
        }
      }
    }
  }
  moveHorisontallyRepeated() {
    let correctKeyCode = this.chooseLeftOrRightKeycode()
    // console.log(currentlyPressed[correctKeyCode], correctKeyCode)
    if (currentlyPressed[correctKeyCode] != undefined) {
      while (millis() - currentlyPressed[correctKeyCode] - this.horisontalIncrementDelay >=
        this.horisontalIncrementFrequency) {
        currentlyPressed[correctKeyCode] += this.horisontalIncrementFrequency
        this.currentTetromino.x += correctKeyCode == 37 ? -1 : 1
        if (this.isColliding(this.currentTetromino)) {
          this.currentTetromino.x -= correctKeyCode == 37 ? -1 : 1
          break
        }
      }
    }
  }
  chooseLeftOrRightKeycode() {
    let output = 37
    if (currentlyPressed[37] != undefined) {
      if (currentlyPressed[39] != undefined) {
        output = currentlyPressed[37] >= currentlyPressed[39] ? 39 : 37
      }
    } else if (currentlyPressed[39] != undefined) {
      output = 39
    }
    return output
  }
  drawHold(x, y) {
    if (this.holdCell != undefined) {
      let deltaX = this.holdCell.type == 4 ? 1 - this.holdCell.x : -this.holdCell.x
      let deltaY = this.holdCell.type == 1 ? -this.holdCell.y : 1 - this.holdCell.y
      this.holdCell.draw(deltaX, deltaY)
    }
  }
  drawQueue(x, y) {
    for (let i = 1; i < 6; i++) {
      let tetromino = this.tetrominoQueue[i]
      let deltaX = 15.5 + x - tetromino.x
      let deltaY = (1 + (i - 1) * 3) - tetromino.y + y
      if (tetromino.type == 1) {
        deltaY--
      } else if (tetromino.type == 4) {
        deltaX++
      }
      tetromino.draw(deltaX, deltaY)
    }
  }
  clearFilledRows() {
    let numberOfClearedRows = 0
    for (let i = 19; i >= 0; i--) {
      let rowIsFull = true
      for (let j = 0; j < 10; j++) {
        if (this.grid[i][j] == 0) {
          rowIsFull = false
          break
        }
      }
      if (rowIsFull) {
        this.grid.splice(i, 1)
        numberOfClearedRows++
      }
    }
    for (let i = 0; i < numberOfClearedRows; i++) {
      this.grid.unshift([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    }
    return numberOfClearedRows
  }
  handleRepeatedButtons() {
    this.moveVerticallyRepeated()
    this.moveHorisontallyRepeated()
  }
  finesseCounter() {
    // Possible improvement, making finesse training possible
  }
  correctTetrominoStartingPosition() {
    while (this.isColliding(this.currentTetromino)) {
      this.currentTetromino.y--
    }
  }
}
