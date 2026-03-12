const Ship = require("./Ship.js")

const getAttackCoordinates = (humanPlayerBoard) => {
    const availableCells = []
    const targetCells = []
    const boardSize = humanPlayerBoard.length

    humanPlayerBoard.forEach((row, rowIndex) => {
        row.forEach((cell, cellIndex) => {
            if (cell.isHit === false) availableCells.push([rowIndex, cellIndex])

            if (cell.element instanceof Ship && cell.isHit === true && cell.element.isSunk() === false) {
                const candidates = [
                    [rowIndex - 1, cellIndex],
                    [rowIndex + 1, cellIndex],
                    [rowIndex, cellIndex - 1],
                    [rowIndex, cellIndex + 1],
                ]

                candidates.forEach(([r, c]) => {
                    if (r < 0 || c < 0 || r >= boardSize || c >= boardSize) return
                    if (humanPlayerBoard[r][c].isHit === false) targetCells.push([r, c])
                })
            }
        })
    })

    const pool = targetCells.length > 0 ? targetCells : availableCells
    if (pool.length === 0) return [0, 0]

    return pool[Math.floor(Math.random() * pool.length)]
}

module.exports = { getAttackCoordinates }
