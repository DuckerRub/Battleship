const Player = require("./Player.js")
const Ship = require("./Ship.js")
const AI = require("./AI.js")

const DOM = (function () {
    const header = document.querySelector(".header")
    const turn = document.querySelector(".turn")
    const container = document.querySelector(".container")

    const setTurnText = (text) => {
        if (turn) turn.textContent = text
    }

    const ensureStartButton = () => {
        let button = document.getElementById("start-button")
        if (button) return button

        button = document.createElement("button")
        button.id = "start-button"
        button.type = "button"
        button.textContent = "Start game"
        header.appendChild(button)
        return button
    }

    const renderBoard = (playerName, gameboard, options = {}) => {
        const showShips = options.showShips === true
        const isSetup = options.isSetup === true

        let boardEl = document.querySelector(`[data-player="${playerName}"]`)
        if (!boardEl) {
            boardEl = document.createElement("div")
            const gameboardSize = gameboard[0].length
            boardEl.className = "gameboard"
            boardEl.dataset.player = playerName
            boardEl.style.cssText = `
                display: grid;
                grid-template-columns: repeat(${gameboardSize}, 50px);
            `
            container.appendChild(boardEl)
        } else {
            boardEl.innerHTML = ""
        }

        const gameboardSize = gameboard[0].length
        const percentage = 100 / gameboardSize + "%"

        gameboard.forEach((row, rowIndex) => {
            row.forEach((cell, columnIndex) => {
                const cellEl = document.createElement("div")
                cellEl.className = "cell"
                cellEl.dataset.playerCell = playerName
                cellEl.dataset.row = rowIndex
                cellEl.dataset.column = columnIndex
                cellEl.style.cssText = `
                    min-width: ${percentage};
                    min-height: ${percentage};
                `

                if (isSetup && playerName === "Player1") cellEl.classList.add("setup-cell")

                if (showShips && cell.element instanceof Ship && cell.isHit === false) {
                    cellEl.classList.add("ship")
                }
                if (cell.element instanceof Ship && cell.isHit === true) cellEl.classList.add("hit-ship")
                if (cell.element === "sea" && cell.isHit === true) cellEl.classList.add("hit-sea")

                boardEl.appendChild(cellEl)
            })
        })
    }

    const clearPreviews = () => {
        const cells = document.querySelectorAll(".cell.preview-valid, .cell.preview-invalid")
        cells.forEach((cell) => cell.classList.remove("preview-valid", "preview-invalid"))
    }

    const applyPreview = (playerName, coordinates, isValid) => {
        clearPreviews()
        const className = isValid ? "preview-valid" : "preview-invalid"
        coordinates.forEach(([row, column]) => {
            const cell = document.querySelector(
                `[data-player-cell="${playerName}"][data-row="${row}"][data-column="${column}"]`,
            )
            if (cell) cell.classList.add(className)
        })
    }

    return {
        container,
        setTurnText,
        ensureStartButton,
        renderBoard,
        clearPreviews,
        applyPreview,
    }
})()

const game = (function () {
    const state = {
        phase: "setup",
        players: {},
    }

    const addPlayer = (player) => {
        state.players[player.name] = player
    }

    const computeCoordinates = (direction, length, row, column) => {
        const coordinates = []
        if (direction === "horizontal") {
            for (let i = 0; i < length; i++) coordinates.push([row, column + i])
        } else {
            for (let i = 0; i < length; i++) coordinates.push([row + i, column])
        }
        return coordinates
    }

    const getShipCoordinates = (board, ship) => {
        const coordinates = []
        board.forEach((row, rowIndex) => {
            row.forEach((cell, columnIndex) => {
                if (cell.element === ship) coordinates.push([rowIndex, columnIndex])
            })
        })
        return coordinates
    }

    const getShipDirection = (coordinates) => {
        if (coordinates.length <= 1) return "horizontal"
        const rows = new Set(coordinates.map((c) => c[0]))
        return rows.size === 1 ? "horizontal" : "vertical"
    }

    const getShipTopLeft = (coordinates) => {
        const minRow = Math.min(...coordinates.map((c) => c[0]))
        const minCol = Math.min(...coordinates.map((c) => c[1]))
        return [minRow, minCol]
    }

    const clearShipFromBoard = (board, ship) => {
        board.forEach((row) => {
            row.forEach((cell) => {
                if (cell.element === ship) {
                    cell.element = "sea"
                    cell.isHit = false
                }
            })
        })
    }

    const isValidMovePlacement = (board, ship, direction, row, column) => {
        const boardSize = board.length
        const coordinates = computeCoordinates(direction, ship.length, row, column)

        const outside = coordinates.some(([r, c]) => r < 0 || c < 0 || r >= boardSize || c >= boardSize)
        if (outside) return false

        const occupied = coordinates.some(([r, c]) => {
            const element = board[r][c].element
            return element !== "sea" && element !== ship
        })

        return !occupied
    }

    const moveShip = (playerName, ship, direction, row, column) => {
        if (state.phase !== "setup") return false
        const player = state.players[playerName]
        if (!player) return false

        const board = player.gameboard.board
        const oldCoordinates = getShipCoordinates(board, ship)
        if (oldCoordinates.length === 0) return false

        clearShipFromBoard(board, ship)
        const placed = player.gameboard.placeShip(ship, direction, row, column)
        if (placed === "outside" || placed === "occupied") {
            const [oldRow, oldCol] = getShipTopLeft(oldCoordinates)
            const oldDirection = getShipDirection(oldCoordinates)
            player.gameboard.placeShip(ship, oldDirection, oldRow, oldCol)
            return false
        }

        return true
    }

    const placeDefaultFleet = (player) => {
        const placements = [
            { length: 5, direction: "horizontal", row: 0, column: 0 },
            { length: 4, direction: "vertical", row: 2, column: 2 },
            { length: 3, direction: "horizontal", row: 6, column: 1 },
            { length: 3, direction: "vertical", row: 1, column: 7 },
            { length: 2, direction: "horizontal", row: 9, column: 5 },
        ]

        placements.forEach((p) => {
            const ship = new Ship(p.length)
            player.gameboard.placeShip(ship, p.direction, p.row, p.column)
        })
    }

    const placeRandomFleet = (player) => {
        const lengths = [2, 3, 3, 4, 5]
        const boardSize = player.gameboard.board.length

        lengths.forEach((length) => {
            const ship = new Ship(length)
            let placed = false
            let attempts = 0

            while (!placed && attempts < 500) {
                attempts++
                const direction = Math.random() > 0.5 ? "horizontal" : "vertical"
                const row = Math.floor(Math.random() * boardSize)
                const column = Math.floor(Math.random() * boardSize)
                const result = player.gameboard.placeShip(ship, direction, row, column)
                if (Array.isArray(result)) placed = true
            }
        })
    }

    const receiveAttack = (attackedPlayerName, row, column) => {
        if (state.phase !== "combat") return

        const attackedPlayer = state.players[attackedPlayerName]
        if (!attackedPlayer) return

        const parsedRow = parseInt(row)
        const parsedColumn = parseInt(column)
        const result = attackedPlayer.gameboard.receiveAttack(parsedRow, parsedColumn)

        DOM.renderBoard(attackedPlayerName, attackedPlayer.gameboard.board, {
            isSetup: false,
            showShips: attackedPlayerName === "Player1",
        })

        if (result === "game over") alert(`Player ${attackedPlayerName} lost! gg`)
        return result
    }

    const executeAIAttack = () => {
        const player1 = state.players.Player1
        if (!player1) return

        const [row, column] = AI.getAttackCoordinates(player1.gameboard.board)
        const result = receiveAttack("Player1", row, column)
        if (result === "hit") executeAIAttack()
    }

    const start = () => {
        const player1 = new Player("Player1", false, 10)
        const ai = new Player("AI", true, 10)
        addPlayer(player1)
        addPlayer(ai)

        placeDefaultFleet(player1)
        placeRandomFleet(ai)

        DOM.renderBoard("Player1", player1.gameboard.board, { isSetup: true, showShips: true })
        DOM.renderBoard("AI", ai.gameboard.board, { isSetup: false, showShips: false })
        DOM.setTurnText("Reposition your ships, then press Start game")

        const startButton = DOM.ensureStartButton()
        startButton.addEventListener("click", () => {
            state.phase = "combat"
            startButton.remove()
            DOM.clearPreviews()
            DOM.setTurnText("Player 1 can start attacking!")
        })
    }

    return {
        state,
        start,
        computeCoordinates,
        getShipCoordinates,
        getShipDirection,
        getShipTopLeft,
        isValidMovePlacement,
        moveShip,
        receiveAttack,
        executeAIAttack,
    }
})()

const dragging = (function () {
    const dragState = {
        active: false,
        ship: null,
        direction: null,
        offset: 0,
    }

    const getShipAt = (row, column) => {
        const player1 = game.state.players.Player1
        if (!player1) return null
        const cell = player1.gameboard.board[row][column]
        if (!cell) return null
        if (!(cell.element instanceof Ship)) return null
        return cell.element
    }

    const getPlacementFromHover = (direction, offset, hoverRow, hoverColumn) => {
        if (direction === "horizontal") return [hoverRow, hoverColumn - offset]
        return [hoverRow - offset, hoverColumn]
    }

    const onPointerDown = (e) => {
        if (game.state.phase !== "setup") return

        const cellEl = e.target.closest(".cell")
        if (!cellEl) return
        if (cellEl.dataset.playerCell !== "Player1") return
        if (!cellEl.classList.contains("setup-cell")) return

        const row = parseInt(cellEl.dataset.row)
        const column = parseInt(cellEl.dataset.column)
        const ship = getShipAt(row, column)
        if (!ship) return

        const player1 = game.state.players.Player1
        const coordinates = game.getShipCoordinates(player1.gameboard.board, ship)
        const direction = game.getShipDirection(coordinates)
        const [topRow, topCol] = game.getShipTopLeft(coordinates)
        const offset = direction === "horizontal" ? column - topCol : row - topRow

        dragState.active = true
        dragState.ship = ship
        dragState.direction = direction
        dragState.offset = offset

        cellEl.setPointerCapture(e.pointerId)
    }

    const onPointerMove = (e) => {
        if (!dragState.active) return
        if (game.state.phase !== "setup") return

        const element = document.elementFromPoint(e.clientX, e.clientY)
        const cellEl = element ? element.closest(".cell") : null
        if (!cellEl || cellEl.dataset.playerCell !== "Player1") {
            DOM.clearPreviews()
            return
        }

        const hoverRow = parseInt(cellEl.dataset.row)
        const hoverColumn = parseInt(cellEl.dataset.column)
        const [row, column] = getPlacementFromHover(dragState.direction, dragState.offset, hoverRow, hoverColumn)

        const player1 = game.state.players.Player1
        const coordinates = game.computeCoordinates(dragState.direction, dragState.ship.length, row, column)
        const isValid = game.isValidMovePlacement(player1.gameboard.board, dragState.ship, dragState.direction, row, column)
        DOM.applyPreview("Player1", coordinates, isValid)
    }

    const onPointerUp = (e) => {
        if (!dragState.active) return

        const element = document.elementFromPoint(e.clientX, e.clientY)
        const cellEl = element ? element.closest(".cell") : null

        if (cellEl && cellEl.dataset.playerCell === "Player1") {
            const hoverRow = parseInt(cellEl.dataset.row)
            const hoverColumn = parseInt(cellEl.dataset.column)
            const [row, column] = getPlacementFromHover(dragState.direction, dragState.offset, hoverRow, hoverColumn)

            const player1 = game.state.players.Player1
            const isValid = game.isValidMovePlacement(player1.gameboard.board, dragState.ship, dragState.direction, row, column)

            if (isValid) {
                const moved = game.moveShip("Player1", dragState.ship, dragState.direction, row, column)
                if (moved) {
                    DOM.renderBoard("Player1", player1.gameboard.board, { isSetup: true, showShips: true })
                }
            }
        }

        DOM.clearPreviews()
        dragState.active = false
        dragState.ship = null
        dragState.direction = null
        dragState.offset = 0
    }

    const attach = () => {
        DOM.container.addEventListener("pointerdown", onPointerDown)
        document.addEventListener("pointermove", onPointerMove)
        document.addEventListener("pointerup", onPointerUp)
        document.addEventListener("pointercancel", onPointerUp)
    }

    return { attach }
})()

const events = (function () {
    DOM.container.addEventListener("click", (e) => {
        const cellEl = e.target.closest(".cell")
        if (!cellEl) return
        if (cellEl.dataset.playerCell !== "AI") return

        const result = game.receiveAttack("AI", cellEl.dataset.row, cellEl.dataset.column)
        if (result === "miss") game.executeAIAttack()
        if (result === "hit") game.executeAIAttack()
    })
})()

game.start()
dragging.attach()

