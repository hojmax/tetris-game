class Tetromino {
  constructor(type) {
    this.type = type
    this.color = getColor(this.type)
    this.reset()
  }
  draw(x, y) {
    push()
    noStroke()
    fill(this.color)
    for (let [i, array] of this.matrix.entries()) {
      for (let [j, element] of array.entries()) {
        if (element != 0) {
          rect((this.x + j + x) * scale, (this.y + i + y) * scale, scale, scale)

        }
      }
    }
    pop()
  }
  drawAsGhost(x, y) {
    this.color.push(70)
    this.draw(x, y)
    this.color.splice(3, 1)
  }
  rotateMatrix(clockwise) {
    if (clockwise) {
      this.matrix = Tetromino.swapRowsAndCols(this.matrix)
      this.matrix = Tetromino.reverseMatrix(this.matrix)
    } else {
      this.matrix = Tetromino.reverseMatrix(this.matrix)
      this.matrix = Tetromino.swapRowsAndCols(this.matrix)
    }
  }
  static reverseMatrix(matrix) {
    let output = []
    for (let [index, array] of matrix.entries()) {
      output.push(array.slice())
      output[index].reverse()
    }
    return output
  }
  static swapRowsAndCols(matrix) {
    let output = []
    for (let i in matrix) {
      output.push([])
    }
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        output[j].push(matrix[i][j])
      }
    }
    return output
  }
  reset() {
    this.matrix = tetrominoMatrices[this.type - 1]
    this.y = this.matrix.length == 4 ? -1 : -Math.floor(this.matrix.length / 2)
    this.x = (Math.floor(5 - this.matrix[0].length / 2))
  }
}
