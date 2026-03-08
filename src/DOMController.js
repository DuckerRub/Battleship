const Player = require('./Player.js');
const Ship = require('./Ship.js');

const DOMManipulation = (function () {
    
    const renderPlayerBoard = function (name, gameboardSize) {
        const container = document.querySelector(".container")
        const playerDOM = document.createElement("div")

        playerDOM.className = "gameboard"
        playerDOM.dataset.player = name
        playerDOM.style.cssText = `
                    display: grid;
                    grid-template-columns: repeat(${gameboardSize}, 1fr);
                `;
        container.appendChild(playerDOM)

        const percentage = (100/gameboardSize) + "%";
        for (let row = 0; row < gameboardSize; row++) {
            for (let column = 0; column < gameboardSize; column++) {
                const cell = document.createElement('div');
                cell.className = "cell"
                cell.dataset.player = name
                cell.dataset.row = row
                cell.dataset.column = column
                cell.style.cssText = `
                        min-width: ${percentage};
                        min-height: ${percentage};
                        box-sizing: border-box;
                    `;
                playerDOM.appendChild(cell);
            }
        }
    }

    const placeShip = function (player, row, column) {
        const cell = document.querySelector(`[data-player="${player}"][data-row="${row}"][data-column="${column}"]`);
        cell.style.backgroundColor = "black"
    }

    return {renderPlayerBoard, placeShip}
})();



function createPlayerAndGameboard(name, isAI, gameboardSize) {
    const player = new Player(name, isAI, gameboardSize);
    DOMManipulation.renderPlayerBoard(name, gameboardSize);

    function createAndPlaceShip(shipLength, direction, row, column) {
        const ship = new Ship(shipLength);
        const coordinates = player.gameboard.placeShip(ship, direction, row, column)
        coordinates.forEach(e => {
            DOMManipulation.placeShip(player.name, e[0], e[1])
        });
    }

    createAndPlaceShip(1, "horizontal", 1, 1);
    createAndPlaceShip(2, "vertical", 6, 0);
    createAndPlaceShip(3, "horizontal", 3, 3);
    createAndPlaceShip(4, "horizontal", 9, 0);
    createAndPlaceShip(5, "vertical", 5, 7);
}

createPlayerAndGameboard("Keds", false, 10);
createPlayerAndGameboard("AI", true, 10);

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('cell')) {
        console.log(`Player: ${e.target.dataset.player}, Row: ${e.target.dataset.row}, Column: ${e.target.dataset.column}`);
    }
});