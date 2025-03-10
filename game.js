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
const startBtn = document.getElementById('startBtn');
const gameBoardDiv = document.getElementById('gameBoard');

const spriteSize = 135;

let gameStarted = false;

startBtn.addEventListener('click', startGame);

function startGame() {
  gameStarted = true;
  initializeBoard();
  renderBoard();
  startBtn.style.display = 'none';
}

function getRandomColor() {
  const randomIndex = Math.floor(Math.random() * colors.length);
  return `url(${colors[randomIndex]})`;
}

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

function hasMatchAt(row, col, color) {
  if (col >= 2 && gameBoard[row][col - 1] === color && gameBoard[row][col - 2] === color) {
    return true;
  }
  if (row >= 2 && gameBoard[row - 1][col] === color && gameBoard[row - 2][col] === color) {
    return true;
  }
  return false;
}

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
      cell.style.width = `${spriteSize}px`;
      cell.style.height = `${spriteSize}px`;
      cell.addEventListener('click', handleCellClick);
      gameBoardDiv.appendChild(cell);
    }
  }
}

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
      await animateSwap(selectedCell, { row, col });
      swapCells(selectedCell.row, selectedCell.col, row, col);
      renderBoard();
      
      if (findMatches()) {
        await handleMatches();
      } else {
        await animateSwap(selectedCell, { row, col });
        swapCells(selectedCell.row, selectedCell.col, row, col);
        renderBoard();
      }
    }
    selectedCell = null;
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function animateSwap(cell1, cell2) {
  const el1 = document.querySelector(`.cell[data-row="${cell1.row}"][data-col="${cell1.col}"]`);
  const el2 = document.querySelector(`.cell[data-row="${cell2.row}"][data-col="${cell2.col}"]`);
  el1.classList.add('swapping');
  el2.classList.add('swapping');
  await delay(300);
  el1.classList.remove('swapping');
  el2.classList.remove('swapping');
}

function swapCells(row1, col1, row2, col2) {
  const tempColor = gameBoard[row1][col1];
  gameBoard[row1][col1] = gameBoard[row2][col2];
  gameBoard[row2][col2] = tempColor;
}

async function handleMatches() {
  let hasMatches;
  do {
    hasMatches = await removeMatchesWithAnimation();
    if (hasMatches) {
      dropCells();
      renderBoard();
      await delay(300);
    }
  } while (hasMatches && findMatches());
}

async function removeMatchesWithAnimation() {
  const matches = findMatches();
  for (const match of matches) {
    const cell = document.querySelector(`.cell[data-row="${match.row}"][data-col="${match.col}"]`);
    if (cell) {
      cell.classList.add('removing');
      await delay(200);
      gameBoard[match.row][match.col] = null;
    }
  }
  return matches.length > 0;
}

function dropCells() {
  for (let col = 0; col < boardWidth; col++) {
    let emptyRow = boardHeight - 1;
    for (let row = boardHeight - 1; row >= 0; row--) {
      if (gameBoard[row][col] !== null) {
        gameBoard[emptyRow][col] = gameBoard[row][col];
        if (row !== emptyRow) gameBoard[row][col] = null;
        emptyRow--;
      }
    }
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
