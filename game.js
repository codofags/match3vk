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


  // Функция для запуска игры
  function startGame() {
    gameStarted = true;
    initializeBoard();
    renderBoard();
    // Скрыть кнопку
    startBtn.style.display = 'none';
  }



  // Функция для создания случайного цвета
  function getRandomColor() {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return `url(${colors[randomIndex]})`; // Возвращаем URL для background-image
  }

  // Функция для инициализации игрового поля
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

  // Функция для проверки наличия совпадений при генерации
  function hasMatchAt(row, col, color) {
    if (col >= 2 && gameBoard[row][col - 1] === color && gameBoard[row][col - 2] === color) {
      return true;
    }
    if (row >= 2 && gameBoard[row - 1][col] === color && gameBoard[row - 2][col] === color) {
      return true;
    }
    return false;
  }

  // Функция для отрисовки игрового поля
  function renderBoard() {

    gameBoardDiv.innerHTML = '';

    gameBoardDiv.style.gridTemplateColumns = `repeat(${boardWidth}, 1fr)`;
    gameBoardDiv.style.gridTemplateRows = `repeat(${boardHeight}, 1fr)`; // Явно задаем grid-template-rows

    for (let row = 0; row < boardHeight; row++) {
      for (let col = 0; col < boardWidth; col++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.row = row;
        cell.dataset.col = col;
        cell.style.backgroundImage = gameBoard[row][col];
        cell.style.width = `${spriteSize}px`;  // Устанавливаем размер ячейки
        cell.style.height = `${spriteSize}px`; // Устанавливаем размер ячейки
        cell.addEventListener('click', handleCellClick);
        gameBoardDiv.appendChild(cell);
      }
    }
  }

  // Функция для обработки клика по ячейке
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

        // Анимация обмена
        cell1.classList.add('swapping');
        cell2.classList.add('swapping');

        // Пауза для анимации
        await delay(200);

        swapCells(selectedCell.row, selectedCell.col, row, col);
        renderBoard();

        cell1.classList.remove('swapping');
        cell2.classList.remove('swapping');

        if (findMatches()) {
          await handleMatches();
        } else {
          // Анимация отмены обмена
          cell1.classList.add('swapping');
          cell2.classList.add('swapping');

          // Пауза для анимации
          await delay(200);

          swapCells(selectedCell.row, selectedCell.col, row, col);
          renderBoard();

          cell1.classList.remove('swapping');
          cell2.classList.remove('swapping');
        }

      }

      selectedCell = null;
    }
  }

  // Функция задержки (для анимаций)
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Функция для обмена ячеек местами
  function swapCells(row1, col1, row2, col2) {
    const tempColor = gameBoard[row1][col1];
    gameBoard[row1][col1] = gameBoard[row2][col2];
    gameBoard[row2][col2] = tempColor;
  }

  // Функция для поиска совпадений
  function findMatches() {
    let matchesFound = false;
    let matches = [];

    // Проверка по горизонтали
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

    // Функция для обработки и удаления совпадений (с анимацией)
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

    async function removeMatchesWithAnimation() {
      let matchesHorizontally = [];
      let matchesVertically = [];

      // Находим горизонтальные совпадения
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
    }

    function dropCells() {
      for (let col = 0; col < boardWidth; col++) {
        let emptyRow = boardHeight - 1;

        for (let row = boardHeight - 1; row >= 0; row--) {
          if (gameBoard[row][col] !== null) {
            gameBoard[emptyRow][col] = gameBoard[row][col];
            if (row !== emptyRow) {
              gameBoard[row][col] = null;
            }
            emptyRow--;
          }
        }
      }
    }