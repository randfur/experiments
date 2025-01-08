import {kPieceShapes} from './pieces.js';

const kWidthPx = innerWidth;
const kHeightPx = innerHeight;
const kCellSizePx = 30;
const kGridRows = 25;
const kGridCols = 11;
const kGridWidthPx = kGridCols * kCellSizePx;
const kGridHeightPx = kGridRows * kCellSizePx;

async function main() {
  const canvas = document.createElement('canvas');
  canvas.width = kWidthPx;
  canvas.height = kHeightPx;
  const context = canvas.getContext('2d');
  document.body.append(canvas);
  document.body.style = `
    padding: 0;
    margin: 0;
    background-color: black;
  `;

  const gameState = init();
  console.log(gameState.grid);
  window.addEventListener('keydown', event => handleKeydown(event, gameState));
  while (true) {
    const time = await new Promise(requestAnimationFrame);
    update(time, gameState);
    draw(context, gameState);
  }
}

function init() {
  return {
    grid: range(kGridRows).map(row => range(kGridCols).map(col => null)),
    piece: createRandomPiece(),
    nextPiece: createRandomPiece(),
    lastTime: performance.now(),
    stepDownTimer: createRepeatingTimer(1000),
  };
}

function update(time, gameState) {
  const timeDelta = Math.min(time - gameState.lastTime, 50);
  gameState.lastTime = time;

  tickRepeatingTimer(timeDelta, gameState.stepDownTimer, () => {
    if (pieceCollided(gameState)) {
      gameState.grid = range(kGridRows).map(row => range(kGridCols).map(col => 'red'));
    }
    gameState.piece.position.row += 1;
    if (pieceCollided(gameState)) {
      gameState.piece.position.row -= 1;
      bakePieceIntoGrid(gameState);
      gameState.piece = gameState.nextPiece;
      gameState.nextPiece = createRandomPiece();
      gameState.piece.position.row = 0;
    }
  });
}

function handleKeydown(event, gameState) {
  if (pieceCollided(gameState)) {
    return
  }
  const {piece} = gameState;
  switch (event.code) {
  case 'ArrowLeft':
  case 'ArrowRight':
    piece.position.col += event.code === 'ArrowLeft' ? -1 : 1;
    if (pieceCollided(gameState)) {
      piece.position.col -= event.code === 'ArrowLeft' ? -1 : 1;
    }
    break;
  case 'ArrowUp': {
    const oldOrientationIndex = piece.orientationIndex;
    piece.orientationIndex = (piece.orientationIndex + 1) % kPieceShapes[piece.index].orientations.length;
    if (pieceCollided(gameState)) {
      piece.orientationIndex = oldOrientationIndex;
    }
    break;
  }
  case 'ArrowDown':
    piece.position.row += 1;
    if (pieceCollided(gameState)) {
      piece.position.row -= 1;
      bakePieceIntoGrid(gameState);
      gameState.piece = gameState.nextPiece;
      gameState.nextPiece = createRandomPiece();
      gameState.piece.position.row = 0;
    }
    break;
  case 'Space':
    while (!pieceCollided(gameState)) {
      piece.position.row += 1;
    }
    piece.position.row -= 1;
    bakePieceIntoGrid(gameState);
    gameState.piece = gameState.nextPiece;
    gameState.nextPiece = createRandomPiece();
    gameState.piece.position.row = 0;
    break;
  }

  switch (event.key) {
  case 'n':
    gameState.piece = gameState.nextPiece;
    gameState.nextPiece = createRandomPiece();
    break;
  }
}

function draw(context, gameState) {
  context.clearRect(0, 0, kWidthPx, kHeightPx);

  context.reset();
  context.translate((kWidthPx - kGridWidthPx) / 2, (kHeightPx - kGridHeightPx) / 2);

  context.lineWidth = 2;
  context.strokeStyle = '#555';
  for (let row = 0; row < kGridRows; ++row) {
    for (let col = 0; col < kGridCols; ++col) {
      const gridCell = gameState.grid[row][col];
      if (gridCell === null) {
        context.strokeStyle = '#555';
        context.strokeRect(col * kCellSizePx, row * kCellSizePx, kCellSizePx, kCellSizePx);
      } else {
        context.fillStyle = gridCell;
        context.fillRect(col * kCellSizePx, row * kCellSizePx, kCellSizePx, kCellSizePx);
      }
    }
  }

  // Current piece
  const pieceShape = kPieceShapes[gameState.piece.index];
  context.fillStyle = pieceShape.colour;
  context.strokeStyle = '#0003';
  const pieceOrientation = pieceShape.orientations[gameState.piece.orientationIndex];
  for (let row = 0; row < pieceShape.size; ++row) {
    for (let col = 0; col < pieceShape.size; ++col) {
      if (pieceOrientation[row][col] === ' ') {
        continue;
      }
      const y = (gameState.piece.position.row + row) * kCellSizePx;
      const x = (gameState.piece.position.col + col) * kCellSizePx;
      context.fillRect(x, y, kCellSizePx, kCellSizePx);
      context.strokeRect(x, y, kCellSizePx, kCellSizePx);
    }
  }
}

function pieceCollided(gameState) {
  // Refactor to dedupe with bakePieceIntoGrid and drawing the piece.
  const pieceShape = kPieceShapes[gameState.piece.index];
  const pieceOrientation = pieceShape.orientations[gameState.piece.orientationIndex];
  for (let row = 0; row < pieceShape.size; ++row) {
    for (let col = 0; col < pieceShape.size; ++col) {
      if (pieceOrientation[row][col] === ' ') {
        continue;
      }
      const gridCol = gameState.piece.position.col + col;
      const gridRow = gameState.piece.position.row + row;
      if (gridCol < 0 || gridCol >= kGridCols || gridRow >= kGridRows) {
        return true;
      }
      if (gameState.grid[gridRow][gridCol] !== null) {
        return true;
      }
    }
  }
  return false;
}

function bakePieceIntoGrid(gameState) {
  const pieceShape = kPieceShapes[gameState.piece.index];
  const pieceOrientation = pieceShape.orientations[gameState.piece.orientationIndex];
  for (let row = 0; row < pieceShape.size; ++row) {
    for (let col = 0; col < pieceShape.size; ++col) {
      if (pieceOrientation[row][col] === ' ') {
        continue;
      }
      const gridCol = gameState.piece.position.col + col;
      const gridRow = gameState.piece.position.row + row;
      if (gridCol < 0 || gridCol >= kGridCols || gridRow >= kGridRows) {
        continue;
      }
      gameState.grid[gridRow][gridCol] = pieceShape.colour;
    }
  }
}

function createRepeatingTimer(duration) {
  return {
    duration,
    remaining: duration,
  };
}

function tickRepeatingTimer(timeDelta, timer, callback) {
  timer.remaining -= timeDelta;
  while (timer.remaining <= 0) {
    timer.remaining += timer.duration;
    callback();
  }
}

function createRandomPiece() {
  const index = chooseIndexWeighted(kPieceShapes);
  return {
    index,
    orientationIndex: Math.floor(Math.random() * kPieceShapes[index].orientations.length),
    position: {
      row: 0,
      col: Math.round((kGridCols - kPieceShapes[index].size) / 2),
    },
  };
}

function chooseItem(list) {
  return list[Math.random() * list.length];
}

function chooseIndexWeighted(weightedList) {
  const total = weightedList.reduce((acc, {weight}) => acc + weight, 0);
  let remaining = Math.random() * total;
  for (let i = 0; i < weightedList.length; ++i) {
    remaining -= weightedList[i].weight;
    if (remaining <= 0) {
      return i;
    }
  }
  return weightedList.length - 1;
}

function range(n) {
  const result = [];
  for (let i = 0; i < n; ++i) {
    result.push(i);
  }
  return result;
}

main();
