const Player = require('./Player.js');
const Ship = require('./Ship.js');
const Gameboard = require('./Gameboard.js');

const DOMManipulation = (function () {
    const container = document.querySelector(".container")
    const turn = document.querySelector(".turn")
    const updateTurn = (nextPlayer) => {
        turn.textContent = `It's ${nextPlayer}'s turn!`;
    }

    const renderPlayerBoard = (playerName, gameboard) => {
        let playerDOM = document.querySelector(`[data-player="${playerName}"]`);
        if (!playerDOM) {
            playerDOM = document.createElement("div");
            const gameboardSize = gameboard[0].length;
            playerDOM.className = "gameboard";
            playerDOM.dataset.player = playerName;
            playerDOM.style.cssText = `
                display: grid;
                grid-template-columns: repeat(${gameboardSize}, 1fr);
            `;
            container.appendChild(playerDOM);
        } else {
            playerDOM.innerHTML = '';
        }

        const gameboardSize = gameboard[0].length;
        const percentage = (100 / gameboardSize) + "%";

        gameboard.forEach((row, rowIndex) => {
            row.forEach((cell, columnIndex) => {
                const cellDiv = document.createElement('div');
                cellDiv.className = "cell";
                cellDiv.dataset.player = playerName;
                cellDiv.dataset.row = rowIndex;
                cellDiv.dataset.column = columnIndex;
                cellDiv.style.cssText = `
                    min-width: ${percentage};
                    min-height: ${percentage};
                    box-sizing: border-box;
                `;
                if (cell.element instanceof Ship) cellDiv.style.backgroundColor = "black";
                if (cell.isHit) cellDiv.textContent = "x";
                playerDOM.appendChild(cellDiv);
            });
        });
    }

    return {renderPlayerBoard, updateTurn}
})();

const eventController = (function () {
    document.addEventListener('click', (e) => {
    if (e.target.classList.contains('cell')) {
        gameplayController.receiveAttack(e.target.dataset.player, e.target.dataset.row, e.target.dataset.column)
    }
});
})();

const gameplayController = (function () {
    const gameState = {
        phase: "combat",
        players: {},
        nextPlayer: "Keds"
    }

    const addPlayer = (playerObject) => {
        gameState.players[playerObject.name] = playerObject
    }

    // TODO clean up the game startup code
    function createPlayerAndGameboard(name, isAI, gameboardSize) {
        const player = new Player(name, isAI, gameboardSize);
        addPlayer(player)
        function createAndPlaceShip(shipLength, direction, row, column) {
            const ship = new Ship(shipLength);
            const coordinates = player.gameboard.placeShip(ship, direction, row, column)
            
        }
        // add default ships to default coordinates
        // createAndPlaceShip(1, "horizontal", 1, 1);
        createAndPlaceShip(2, "vertical", 6, 0);
        // createAndPlaceShip(3, "horizontal", 3, 3);
        // createAndPlaceShip(4, "horizontal", 9, 0);
        // createAndPlaceShip(5, "vertical", 5, 7);

        DOMManipulation.renderPlayerBoard(player.name, player.gameboard.board);
    }
    createPlayerAndGameboard("Keds", false, 10)
    createPlayerAndGameboard("AI", true, 10)
    // end of startup code

    const receiveAttack = (playerName, row, column) => {
        const player = gameState.players[playerName]
        const result = player.gameboard.receiveAttack(row, column);
        console.log(result);
        DOMManipulation.renderPlayerBoard(playerName, player.gameboard.board);
        switchPlayer(playerName);
        // TODO properly control turns, including if you get a hit you play again, 
        // and controls to pprevent playing twice
    }

    const switchPlayer = (playerName) => {
        gameState.nextPlayer = playerName;
        DOMManipulation.updateTurn(gameState.nextPlayer)
    }

    return {receiveAttack}
})();