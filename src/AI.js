const Ship = require('./Ship.js');

const getAttackCoordinates = (humanPlayerBoard) => {
    const availableCells = [];
    humanPlayerBoard.forEach((row, rowIndex) => {
        row.forEach((cell, cellIndex) => {
            if (cell.isHit === false) availableCells.push([rowIndex, cellIndex])
        });
    });

    const coordinates = availableCells[Math.floor(Math.random() * availableCells.length)];

    return coordinates
}

module.exports = {getAttackCoordinates}