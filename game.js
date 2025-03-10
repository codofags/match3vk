const boardWidth = 8;
const boardHeight = 8;
const colors = [
  'img/red.png',
  'img/blue.png',
  'img/green.png',
  'img/yellow.png',
  'img/purple.png',
  'img/white.png'
];
let gameBoard = [];
let selectedCell = null;
const gameBoardDiv = document.getElementById('gameBoard');

// Calculate new size
const sizeReduction = 0.75; // 25% reduction
const spriteSize = 135 * sizeReduction; //135 * 0.75;

let gameStarted = false;

// Function to start the game
function startGame() {
  gameStarted = true;
  initializeBoard();
  renderBoard();
}

// Function to generate a random color
function getRandomColor() {
  const randomIndex = Math.floor(Math.random() * colors.length);
  return `url(${colors[randomIndex]})`; // Returns URL for background-image
}

// Function to initialize the game board
function initializeBoard() {
  gameBoard = [];
  for (let row = 0; row < boardHeight; row++) {
    gameBoard[row] = [];
    for (let col = 0; col < boardWidth; col++) {
      let color;
      do {
        color = getRandomColor();
      } while (hasMatchAt(row, col, color));
      gameBoard[row][col] = color;
    }
  }
}

// Function to check for matches during generation
function hasMatchAt(row, col, color) {
  if (col >= 2 && gameBoard[row][col - 1] === color && gameBoard[row][col - 2] === color) {
    return true;
  }
  if (row >= 2 && gameBoard[row - 1][col] === color && gameBoard[row - 2][col] === color) {
    return true;
  }
  return false;
}

// Function to render the game board
function renderBoard() {

  gameBoardDiv.innerHTML = '';

  gameBoardDiv.style.gridTemplateColumns = `repeat(${boardWidth}, 1fr)`;
  gameBoardDiv.style.gridTemplateRows = `repeat(${boardHeight}, 1fr)`;

  for (let row = 0; row < boardHeight; row++) {
    for (let col = 0; col < boardWidth; col++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.style.backgroundImage = gameBoard[row][col];
      cell.style.width = `${spriteSize}px`;  // Set cell size
      cell.style.height = `${spriteSize}px`; // Set cell size
      cell.addEventListener('click', handleCellClick);
      gameBoardDiv.appendChild(cell);
    }
  }
}

// Function to handle cell click
async function handleCellClick(event) {
  if (!gameStarted) return;
  const row = parseInt(event.target.dataset.row);
  const col = parseInt(event.target.dataset.col);

  if (selectedCell === null) {
    selectedCell = { row, col };
  } else {
    const rowDiff = Math.abs(row - selectedCell.row);
    const colDiff = Math.abs(col - selectedCell.col);

    if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
      const cell1 = document.querySelector(`.cell[data-row="${selectedCell.row}"][data-col="${selectedCell.col}"]`);
      const cell2 = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);

      // Swap animation
      cell1.classList.add('swapping');
      cell2.classList.add('swapping');

      // Animation pause
      await delay(100);

      swapCells(selectedCell.row, selectedCell.col, row, col);
      renderBoard();

      cell1.classList.remove('swapping');
      cell2.classList.remove('swapping');

      if (findMatches()) {
        await handleMatches();
      } else {
        // Undo swap animation
        cell1.classList.add('swapping');
        cell2.classList.add('swapping');

        // Animation pause
        await delay(100);

        swapCells(selectedCell.row, selectedCell.col, row, col);
        renderBoard();

        cell1.classList.remove('swapping');
        cell2.classList.remove('swapping');
      }

    }

    selectedCell = null;
  }
}

// Delay function for animations
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to swap cells
function swapCells(row1, col1, row2, col2) {
  const tempColor = gameBoard[row1][col1];
  gameBoard[row1][col1] = gameBoard[row2][col2];
  gameBoard[row2][col2] = tempColor;
}

// Function to find matches
function findMatches() {
  let matchesFound = false;
  let matches = [];

  // Horizontal check
  for (let row = 0; row < boardHeight; row++) {
    for (let col = 0; col < boardWidth - 2; col++) {
      const color = gameBoard[row][col];
      if (color && color === gameBoard[row][col + 1] && color === gameBoard[row][col + 2]) {
        matches.push({ row, col });
        matches.push({ row, col: col + 1 });
        matches.push({ row, col: col + 2 });
      }
    }
  }

  // Vertical check
  for (let col = 0; col < boardWidth; col++) {
    for (let row = 0; row < boardHeight - 2; row++) {
      const color = gameBoard[row][col];
      if (color && color === gameBoard[row + 1][col] && color === gameBoard[row + 2][col]) {
        matches.push({ row, col });
        matches.push({ row: row + 1, col });
        matches.push({ row: row + 2, col });
      }
    }
  }
  if (matches.length > 0) {
    matchesFound = true;
  }
  return matchesFound;
}

// Function to handle and remove matches (with animation)
async function handleMatches() {
  let hasMatches;
  do {
    hasMatches = await removeMatchesWithAnimation();

    if (hasMatches) {
      dropCells();
      renderBoard();
    }
  } while (hasMatches && findMatches());
}

// Function to remove matches with animation
async function removeMatchesWithAnimation() {
  let matchesHorizontally = [];
  let matchesVertically = [];

  // Find horizontal matches
  for (let row = 0; row < boardHeight; row++) {
    for (let col = 0; col < boardWidth - 2; col++) {
      const color = gameBoard[row][col];
      if (color === gameBoard[row][col + 1] && color === gameBoard[row][col + 2]) {
        matchesHorizontally.push({ row, col });
        matchesHorizontally.push({ row, col: col + 1 });
        matchesHorizontally.push({ row, col: col + 2 });
        col += 2;
      }
    }
  }

  // Find vertical matches
  for (let col = 0; col < boardWidth; col++) {
    for (let row = 0; row < boardHeight - 2; row++) {
      const color = gameBoard[row][col];
      if (color === gameBoard[row + 1][col] && color === gameBoard[row + 2][col]) {
        matchesVertically.push({ row, col });
        matchesVertically.push({ row: row + 1, col });
        matchesVertically.push({ row: row + 2, col });
        row += 2;
      }
    }
  }

  const allMatches = new Set([...matchesHorizontally.map(m => JSON.stringify(m)), ...matchesVertically.map(m => JSON.stringify(m))]);
  const uniqueMatches = Array.from(allMatches).map(m => JSON.parse(m));

  // Animate removal
  for (const match of uniqueMatches) {
    const cell = document.querySelector(`.cell[data-row="${match.row}"][data-col="${match.col}"]`);
    if (cell) {
      cell.classList.add('removing');
      await delay(100);
      gameBoard[match.row][match.col] = null;
    }
  }
  return uniqueMatches.length > 0;
}

// Function to drop cells
function dropCells() {
  for (let col = 0; col < boardWidth; col++) {
    let emptyRow = boardHeight - 1;

    // Shift existing cells down
    for (let row = boardHeight - 1; row >= 0; row--) {
      if (gameBoard[row][col] !== null) {
        gameBoard[emptyRow][col] = gameBoard[row][col];
        if (row !== emptyRow) {
          gameBoard[row][col] = null;
        }
        emptyRow--;
      }
    }

    // Fill remaining empty cells
    while (emptyRow >= 0) {
      let color;
      do {
        color = getRandomColor();
      } while (hasMatchAt(emptyRow, col, color));
      gameBoard[emptyRow][col] = color;
      emptyRow--;
    }
  }
}