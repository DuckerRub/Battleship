# AGENTS.md - Battleship Project Guidelines

## Overview

This is a Battleship game built with vanilla JavaScript using Jest for testing and Webpack for bundling.

---

## Commands

### Running Tests

- **Run all tests:** `npm test`
- **Run a single test file:** `npm test -- <filename>` (e.g., `npm test -- index.test.js`)
- **Run a specific test:** `npm test -- --testNamePattern="test name"`
- **Run tests in watch mode:** `npm test -- --watch`
- **Run tests with coverage:** `npm test -- --coverage`

### Linting & Formatting

- **Run ESLint:** `npx eslint .`
- **Fix ESLint issues:** `npx eslint . --fix`
- **Run Prettier:** `npx prettier --check .`
- **Format with Prettier:** `npx prettier --write .`

### Development

- **Start dev server:** `npm start` (opens webpack dev server)
- **Build for production:** `npx webpack --mode production`

---

## Code Style Guidelines

### General

- Use **CommonJS** (`require()`) for module imports, not ES modules
- Use 4 spaces for indentation
- No semicolons at end of statements
- No comments in code unless explaining complex logic

### Naming Conventions

- **Classes:** PascalCase (e.g., `Gameboard`, `Player`)
- **Functions/variables:** camelCase (e.g., `placeShip`, `getAttackCoordinates`)
- **Constants:** UPPER_SNAKE_CASE if truly constant (e.g., `BOARD_SIZE`)
- **Files:** kebab-case for modules (e.g., `gameboard.js`, `ship.js`)

### Functions & Classes

- Use ES6 class syntax
- Keep functions small and focused (under ~15 lines when possible)
- Use arrow functions for callbacks
- Place opening brace on same line as declaration

```javascript
class Gameboard {
  constructor(size) {
    this.board = [];
  }

  placeShip(ship, direction, row, column) {
    // ...
  }
}
```

### Error Handling

- Return descriptive strings for error conditions ("occupied", "outside", "illegal", "miss", "hit", "unknown", "game over")
- Validate inputs at function entry points
- Do not throw errors for game logic; return status strings instead

```javascript
placeShip(ship, direction, row, column) {
  if (direction === "horizontal") {
    if (column + ship.length > this.board.length) return "outside"
  }
  // ...
}
```

### Testing

- Use Jest with `test()` function
- Test file naming: `<module>.test.js` (e.g., `Ship.test.js`) or `index.test.js` for integration tests
- Group related tests with `describe()` blocks
- Use descriptive test names: `'Places ship at correct coordinate - horizontal'`
- Use strict equality matchers (`toStrictEqual`, `toBe`)

```javascript
test("Creates ship of correct length", () => {
  const ship = new Ship(2);
  expect(ship.length).toBe(2);
});

describe("Gameboard", () => {
  test("Places ship at correct coordinate - horizontal", () => {
    const gameboard = new Gameboard(10);
    const ship = new Ship(3);
    expect(gameboard.placeShip(ship, "horizontal", 3, 3)).toStrictEqual([
      [3, 3],
      [3, 4],
      [3, 5],
    ]);
  });
});
```

### Imports/Exports

- Use `module.exports = ClassName` for exports
- Use `const Module = require('./Module.js')` for imports
- One require per line
- Order: built-in modules first, then local modules

```javascript
const Gameboard = require("./Gameboard.js");
const Ship = require("./Ship.js");
```

### Types

- This is vanilla JavaScript - no type annotations required
- Use JSDoc comments if type information aids understanding
- Validate function parameters internally when needed

### Game Constants

- Board size is typically 10x10
- Use descriptive strings for board elements: "sea" for empty cells
- Directions: "horizontal" and "vertical"

```javascript
this.board[row][column] = { element: "sea", isHit: false };
```

### Best Practices

- Keep files under 200 lines
- One class per file
- Export only what's needed
- Use meaningful variable names
- Avoid magic numbers - use constants
- Test edge cases (boundary conditions, occupied spaces, out of bounds)
- Return early to avoid nested conditionals

---

## Project Structure

```
src/
  index.html       # Entry HTML
  index.js         # Main entry point
  index.test.js    # Integration tests
  Ship.js          # Ship class
  Gameboard.js     # Gameboard class
  Player.js        # Player class
  AI.js            # AI utilities
  gameplay.js      # Gameplay logic
  styles.css       # CSS styles
```

---

## Configuration Files

- `eslint.config.mjs` - ESLint config (browser globals)
- `.prettierrc` - Prettier config (uses defaults)
- `babel.config.js` - Babel for Jest compatibility
- `webpack.config.js` - Webpack bundler config
- `package.json` - Project dependencies and scripts

---

## Important Notes

- Jest is configured via package.json scripts
- Tests run from the `src/` directory
- The game uses a coordinate system where [row, column] represents positions
- Ship placement returns coordinates array on success, error string on failure
- Attack results: "miss", "hit", "illegal", "game over", "unknown"
