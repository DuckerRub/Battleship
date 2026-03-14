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

    const ensurePlayer2TypeToggle = () => {
        let wrapper = document.getElementById("player2-type-wrapper")
        if (wrapper) return wrapper

        wrapper = document.createElement("div")
        wrapper.id = "player2-type-wrapper"
        wrapper.className = "player2-type"

        const label = document.createElement("label")
        label.setAttribute("for", "player2-type")
        label.textContent = "Player 2:"

        const select = document.createElement("select")
        select.id = "player2-type"
        select.name = "player2-type"

        const aiOption = document.createElement("option")
        aiOption.value = "ai"
        aiOption.textContent = "AI"

        const humanOption = document.createElement("option")
        humanOption.value = "human"
        humanOption.textContent = "Human"

        select.appendChild(aiOption)
        select.appendChild(humanOption)

        wrapper.appendChild(label)
        wrapper.appendChild(select)

        const startButton = document.getElementById("start-button")
        if (startButton) header.insertBefore(wrapper, startButton)
        else header.appendChild(wrapper)

        return wrapper
    }

    const getPlayer2TypeToggle = () => {
        const wrapper = ensurePlayer2TypeToggle()
        return wrapper.querySelector("#player2-type")
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

    const ensureRandomizeButton = () => {
        const randomizeButton = document.getElementById("randomize-button");
        if (randomizeButton) return randomizeButton
        const newRandomizeButton = document.createElement("button");
        newRandomizeButton.id = "randomize-button"
        newRandomizeButton.type = "button"
        newRandomizeButton.textContent = "Randomize"
        header.insertBefore(newRandomizeButton, header.children[1] || null);
        return newRandomizeButton
    }

    const setBoardHidden = (playerName, hidden) => {
        const boardEl = document.querySelector(`[data-player="${playerName}"]`)
        if (!boardEl) return
        if (hidden) boardEl.classList.add("hidden")
        else boardEl.classList.remove("hidden")
    }

    const renderBoard = (playerName, gameboard, options = {}) => {
        const showShips = options.showShips === true
        const isSetup = options.isSetup === true
        const setupPlayerName = options.setupPlayerName

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

                if (isSetup && setupPlayerName && playerName === setupPlayerName) cellEl.classList.add("setup-cell")

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

    const dimAttackersBoard = (playerName, dimmed) => {
        const boardEl = document.querySelector(`[data-player="${playerName}"]`);
        if (!boardEl) return
        if (dimmed) boardEl.classList.add("attackers-board")
        else boardEl.classList.remove("attackers-board");
    }

    return {
        container,
        setTurnText,
        ensurePlayer2TypeToggle,
        getPlayer2TypeToggle,
        ensureStartButton,
        setBoardHidden,
        renderBoard,
        clearPreviews,
        applyPreview,
        dimAttackersBoard,
        ensureRandmizeButton: ensureRandomizeButton
    }
})()

const game = (function () {
    const state = {
        phase: "setup-p1",
        config: {
            player2Type: "ai",
        },
        setup: {
            player2FleetPlaced: false,
        },
        turn: "Player1",
        players: {},
    }

    const addPlayer = (player) => {
        state.players[player.name] = player
    }

    const resetPlayer2 = (type) => {
        delete state.players.Player2

        const player2 = new Player("Player2", type === "ai", 10)
        addPlayer(player2)

        state.config.player2Type = type
        state.setup.player2FleetPlaced = false

        if (type === "ai") {
            placeRandomFleet(player2)
            state.setup.player2FleetPlaced = true
        }
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
        if (!getSetupPlayerName()) return false
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

    const placeRandomFleet = (player) => {
        const lengths = [1, 1, 2, 2, 3, 3, 4, 5]
        const boardSize = player.gameboard.board.length

        player.gameboard.resetBoard();

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

        renderForPhase()

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

    const getSetupPlayerName = () => {
        if (state.phase === "setup-p1") return "Player1"
        if (state.phase === "setup-p2") return "Player2"
        return null
    }

    const isHumanVsHuman = () => state.config.player2Type === "human"

    const getShowShipsForCombat = (playerName) => {
        if (isHumanVsHuman()) return false
        return playerName === "Player1"
    }

    const renderForPhase = () => {
        const player1 = state.players.Player1
        const player2 = state.players.Player2
        if (!player1 || !player2) return

        const setupPlayerName = getSetupPlayerName()
        const isSetup = setupPlayerName !== null

        const showP1Ships = isSetup ? setupPlayerName === "Player1" : getShowShipsForCombat("Player1")
        const showP2Ships = isSetup ? setupPlayerName === "Player2" : getShowShipsForCombat("Player2")

        DOM.renderBoard("Player1", player1.gameboard.board, { isSetup, showShips: showP1Ships, setupPlayerName})
        DOM.renderBoard("Player2", player2.gameboard.board, { isSetup, showShips: showP2Ships, setupPlayerName})

        const hidePlayer1 = state.phase === "setup-p2" || state.phase === "handoff-to-p2"
        const hidePlayer2 = state.phase === "handoff-to-p2" || (state.phase === "setup-p1" && isHumanVsHuman())

        DOM.setBoardHidden("Player1", hidePlayer1)
        DOM.setBoardHidden("Player2", hidePlayer2)

        if (isHumanVsHuman() && state.phase === "combat") {
            const dimPlayer1 = state.turn === "Player1"
            const dimPlayer2 = state.turn === "Player2"
    
            DOM.dimAttackersBoard("Player1", dimPlayer1)
            DOM.dimAttackersBoard("Player2", dimPlayer2)
        }
        
    }

    const enterCombat = () => {
        state.phase = "combat"
        state.turn = "Player1"

        DOM.clearPreviews()
        renderForPhase()

        if (isHumanVsHuman()) {
            DOM.setTurnText("Player 1: choose a target to attack")
        } else {
            DOM.setTurnText("Player 1 can start attacking!")
        }
    }

    const start = () => {
        const player1 = new Player("Player1", false, 10)
        const player2 = new Player("Player2", true, 10)
        addPlayer(player1)
        addPlayer(player2)

        placeRandomFleet(player1)
        placeRandomFleet(player2)
        state.setup.player2FleetPlaced = true

        const startButton = DOM.ensureStartButton()
        const randomizeButton = DOM.ensureRandmizeButton();
            randomizeButton.addEventListener("click", () => {
                const player = state.phase === "setup-p1" ? "Player1" : "Player2"
                placeRandomFleet(state.players[player]);
                renderForPhase()
            })

        const toggle = DOM.getPlayer2TypeToggle()
        const toggleWrapper = toggle.parentElement
        toggle.value = state.config.player2Type

        toggle.addEventListener("change", () => {
            if (state.phase !== "setup-p1") return
            resetPlayer2(toggle.value)

            if (isHumanVsHuman()) {
                startButton.textContent = "Continue"
                DOM.setTurnText("Reposition your ships by dragging them, or click on: ")
            } else {
                startButton.textContent = "Start game"
                DOM.setTurnText("Reposition your ships by dragging them, or click on: ")
            }

            renderForPhase()
        })

        startButton.textContent = "Start game"
        DOM.setTurnText("Reposition your ships by dragging them, or click on: ")
        renderForPhase()

        startButton.addEventListener("click", () => {
            if (state.phase === "setup-p1") {
                randomizeButton.style.display = "none"
                if (isHumanVsHuman()) {
                    state.phase = "handoff-to-p2"
                    startButton.textContent = "Continue"
                    if (toggleWrapper) toggleWrapper.remove()
                    DOM.setTurnText("Pass device to Player 2")
                    renderForPhase()
                    return
                }

                if (toggleWrapper) toggleWrapper.remove()
                startButton.remove()
                enterCombat()
                return
            }

            if (state.phase === "handoff-to-p2") {
                state.phase = "setup-p2"
                randomizeButton.style.display = "block"
                
                if (!state.setup.player2FleetPlaced) {
                    placeRandomFleet(state.players.Player2)
                    state.setup.player2FleetPlaced = true
                }

                startButton.textContent = "Start game"
                DOM.setTurnText("Player 2: reposition your ships by dragging them, or click on: ")
                renderForPhase()
                return
            }

            if (state.phase === "setup-p2") {
                startButton.remove()
                randomizeButton.style.display = "none"
                enterCombat()
            }
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
        getSetupPlayerName,
        renderForPhase,
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
        const setupPlayerName = game.getSetupPlayerName()
        if (!setupPlayerName) return null
        const player = game.state.players[setupPlayerName]
        if (!player) return null
        const cell = player.gameboard.board[row][column]
        if (!cell) return null
        if (!(cell.element instanceof Ship)) return null
        return cell.element
    }

    const getPlacementFromHover = (direction, offset, hoverRow, hoverColumn) => {
        if (direction === "horizontal") return [hoverRow, hoverColumn - offset]
        return [hoverRow - offset, hoverColumn]
    }

    const onPointerDown = (e) => {
        const setupPlayerName = game.getSetupPlayerName()
        if (!setupPlayerName) return

        const cellEl = e.target.closest(".cell")
        if (!cellEl) return
        if (cellEl.dataset.playerCell !== setupPlayerName) return
        if (!cellEl.classList.contains("setup-cell")) return

        const row = parseInt(cellEl.dataset.row)
        const column = parseInt(cellEl.dataset.column)
        const ship = getShipAt(row, column)
        if (!ship) return

        const player = game.state.players[setupPlayerName]
        const coordinates = game.getShipCoordinates(player.gameboard.board, ship)
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
        const setupPlayerName = game.getSetupPlayerName()
        if (!setupPlayerName) return

        const element = document.elementFromPoint(e.clientX, e.clientY)
        const cellEl = element ? element.closest(".cell") : null
        if (!cellEl || cellEl.dataset.playerCell !== setupPlayerName) {
            DOM.clearPreviews()
            return
        }

        const hoverRow = parseInt(cellEl.dataset.row)
        const hoverColumn = parseInt(cellEl.dataset.column)
        const [row, column] = getPlacementFromHover(dragState.direction, dragState.offset, hoverRow, hoverColumn)

        const player = game.state.players[setupPlayerName]
        const coordinates = game.computeCoordinates(dragState.direction, dragState.ship.length, row, column)
        const isValid = game.isValidMovePlacement(player.gameboard.board, dragState.ship, dragState.direction, row, column)
        DOM.applyPreview(setupPlayerName, coordinates, isValid)
    }

    const onPointerUp = (e) => {
        if (!dragState.active) return

        const element = document.elementFromPoint(e.clientX, e.clientY)
        const cellEl = element ? element.closest(".cell") : null

        const setupPlayerName = game.getSetupPlayerName()
        if (cellEl && setupPlayerName && cellEl.dataset.playerCell === setupPlayerName) {
            const hoverRow = parseInt(cellEl.dataset.row)
            const hoverColumn = parseInt(cellEl.dataset.column)
            const [row, column] = getPlacementFromHover(dragState.direction, dragState.offset, hoverRow, hoverColumn)

            const player = game.state.players[setupPlayerName]
            const isValid = game.isValidMovePlacement(player.gameboard.board, dragState.ship, dragState.direction, row, column)

            if (isValid) {
                const moved = game.moveShip(setupPlayerName, dragState.ship, dragState.direction, row, column)
                if (moved) {
                    game.renderForPhase()
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
        if (game.state.phase !== "combat") return

        if (game.state.config.player2Type === "ai") {
            if (cellEl.dataset.playerCell !== "Player2") return

            const result = game.receiveAttack("Player2", cellEl.dataset.row, cellEl.dataset.column)
            if (result === "miss") game.executeAIAttack()
            return
        }

        const attacker = game.state.turn
        const defender = attacker === "Player1" ? "Player2" : "Player1"
        if (cellEl.dataset.playerCell !== defender) return

        const result = game.receiveAttack(defender, cellEl.dataset.row, cellEl.dataset.column)
        if (!result) return
        if (result === "illegal" || result === "game over") return

        if (result === "miss") {
            game.state.turn = defender
            const turnText =
                defender === "Player1" ? "Player 1: choose a target to attack" : "Player 2: choose a target to attack"
            DOM.setTurnText(turnText)
            game.renderForPhase()
        }
    })
})()

game.start()
dragging.attach()
