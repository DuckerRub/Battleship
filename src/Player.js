const Gameboard = require('./Gameboard.js');

class Player {
    constructor(name, isAI) {
        this.name = name
        this.isAI = isAI
        this.gameboard = new Gameboard(10)
    }
}

module.exports = Player