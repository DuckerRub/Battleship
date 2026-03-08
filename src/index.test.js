const Ship = require('./Ship.js');
const Gameboard = require('./Gameboard.js');
const Player = require('./Player.js');

//Ship tests
test('Creates ship of correct length', () => {
  const ship = new Ship (2)
  expect(ship.length).toBe(2);
});

test('Hits a ship', () => {
  const ship = new Ship (2)
  ship.hit();
  expect(ship.hits).toBe(1);
});

test('Hits a ship but doesnt sink', () => {
  const ship = new Ship (2)
  ship.hit();
  expect(ship.isSunk()).toBe(false);
});

test('Sunks a ship if hits equals hits', () => {
  const ship = new Ship (5)
  for (let index = 0; index < ship.length; index++) {
    ship.hit();
  }
  expect(ship.isSunk()).toBe(true);
});

// Gameboard tests

test('Creates gameboard of equal proportions', () => {
  let size = 10;
  const gameboard = new Gameboard (size);
  const totalSize = gameboard.board.length * gameboard.board[0].length
  expect(totalSize).toBe(size*size);
});

test('Places ship at correct coordinate - horizontal', () => {
    const gameboard = new Gameboard (10)
    const ship = new Ship (3);
    const direction = "horizontal"
    const row = 3
    const column = 3
    expect(gameboard.placeShip(ship, direction, row, column)).toStrictEqual([[3,3], [3,4], [3,5]]);
});

test('Places ship at correct coordinate - vertical', () => {
    const gameboard = new Gameboard (10)
    const ship = new Ship (4);
    const direction = "vertical"
    const row = 5
    const column = 4
    expect(gameboard.placeShip(ship, direction, row, column)).toStrictEqual([[5,4], [6,4], [7,4], [8,4]]);
});

test('Places ship at occupied space', () => {
    const gameboard = new Gameboard (10)
    const ship = new Ship (4);
    const direction = "vertical"
    const row = 2
    const column = 2
    gameboard.placeShip(ship, direction, row, column)
  
    const ship2 = new Ship (3);
    const direction2 = "vertical"
    const row2 = 3
    const column2 = 2
    expect(gameboard.placeShip(ship2, direction2, row2, column2)).toBe("occupied");
});

test('Places ship outside the board', () => {
    const gameboard = new Gameboard (10)
    const ship = new Ship (4);
    const direction = "vertical"
    const row = 8
    const column = 8
    expect(gameboard.placeShip(ship, direction, row, column)).toBe("outside");
});

test('Attacks a ship and ship gets hit', () => {
  const gameboard = new Gameboard (10)
  const ship = new Ship (3);
  const placementDirection = "horizontal"
  const row = 3
  const column = 3
  gameboard.placeShip(ship, placementDirection, row, column)
  gameboard.receiveAttack(3,5)
  gameboard.receiveAttack(3,4)
  gameboard.receiveAttack(3,6)
  expect(ship.hits).toBe(2);
});

test('Tracks misses', () => {
  const gameboard = new Gameboard (10)
  gameboard.receiveAttack(4,3)
  expect(gameboard.receiveAttack(4,3)).toBe("illegal");
});

test('Cant attack the same place twice', () => {
  const gameboard = new Gameboard (10)
  gameboard.receiveAttack(4,3)
  expect(gameboard.receiveAttack(4,3)).toBe("illegal");
});

test('Sinks some ships but not game over yet', () => {
  const gameboard = new Gameboard (10)
  const ship = new Ship (2);
  const placementDirection = "horizontal"
  const row = 3
  const column = 3
  gameboard.placeShip(ship, placementDirection, row, column)
  gameboard.receiveAttack(3,3)
  gameboard.receiveAttack(3,4)

  const ship2 = new Ship (2);
  const placementDirection2 = "vertical"
  const row2 = 6
  const column2 = 6
  gameboard.placeShip(ship2, placementDirection2, row2, column2)
  gameboard.receiveAttack(6,6)

  expect(gameboard.isGameOver()).toBe(false);
});

test('Sinks all ships', () => {
  const gameboard = new Gameboard (10)
  const ship = new Ship (2);
  const placementDirection = "horizontal"
  const row = 3
  const column = 3
  gameboard.placeShip(ship, placementDirection, row, column)
  gameboard.receiveAttack(3,3)
  gameboard.receiveAttack(3,4)

  const ship2 = new Ship (2);
  const placementDirection2 = "vertical"
  const row2 = 6
  const column2 = 6
  gameboard.placeShip(ship2, placementDirection2, row2, column2)
  gameboard.receiveAttack(6,6)
  gameboard.receiveAttack(7,6)

  expect(gameboard.isGameOver()).toBe(true);
});

//Player tests
test('Creates a player', () => {
  const player = new Player('Test', false)
  expect(player.name).toBe('Test')
})

test('Creates a board for player', () => {
  const player = new Player('Test', false)
  expect(player.gameboard instanceof Gameboard).toBe(true)
})

test('Creates an AI player', () => {
  const player = new Player('AI', true)
  expect(player.isAI).toBe(true)
})