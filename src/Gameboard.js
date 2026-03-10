const Ship = require('./Ship.js');

class Gameboard {
    constructor(size) {
        this.board = [];
        for (let row = 0; row < size; row++) {
            this.board[row] = [];
            for (let column = 0; column < size; column++) {
                this.board[row][column] = {element: "sea", isHit: false};
            }
        }
    }

    placeShip (ship, direction, row, column) {
        const coordinates = [];
        if (direction === "horizontal") {
            if (column + ship.length > this.board.length) return "outside"
            for (let i = 0; i < ship.length; i++) {
                coordinates.push([row, column + i])
            }
        } else {
            if (row + ship.length > this.board.length) return "outside"
            for (let i = 0; i < ship.length; i++) {
                coordinates.push([row + i, column])
            }
        }
        
        if (coordinates.some(e => this.board[e[0]][e[1]].element !== "sea")) return "occupied"

        coordinates.forEach(e => {
            this.board[e[0]][e[1]] = {element: ship, isHit: false}
        });

        return coordinates
        
    }

    receiveAttack (row, column) {
        if (this.board[row][column].isHit === true) return "illegal"

        if (this.board[row][column].element === "sea") {
                this.board[row][column].isHit = true
             return "miss"
        }
        if (this.board[row][column].element instanceof Ship) {
                this.board[row][column].element.hit()
                this.board[row][column].isHit = true
                if (this.isGameOver()) return "game over"
                return "hit"
        } else return "unknown"
    }

    isGameOver () {
        if (this.board.some(row => row.some(cell => cell.element instanceof Ship && !cell.element.isSunk()))) return false
        return true
    }
}

module.exports = Gameboard