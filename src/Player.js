const Gameboard = require('./Gameboard.js');

class Player {
    constructor(name, isAI, gameboardSize) {
        this.name = name
        this.isAI = isAI
        this.gameboard = new Gameboard(gameboardSize)
    }
}

module.exports = Player