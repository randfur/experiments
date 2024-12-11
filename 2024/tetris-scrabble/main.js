import {kPieceShapes} from './pieces.js';

const kWidthPx = innerWidth;
const kHeightPx = innerHeight;
const kCellSizePx = 30;
const kGridRows = 25;
const kGridCols = 10;
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

  let gameState = {
    grid: range(kGridRows).map(row => range(kGridCols).map(col => null)),
    piece: null,
    nextPiece: null,
  };

  gameState.piece = makeRandomPiece();
  gameState.nextPiece = makeRandomPiece();

  while (true) {
    // await new Promise(requestAnimationFrame);
    await new Promise(resolve => setTimeout(resolve, 100));
    gameState.piece = makeRandomPiece();
    draw({context, gameState});
  }
}

function makeRandomPiece() {
  const index = chooseIndexWeighted(kPieceShapes);
  return {
    index,
    orientationIndex: Math.floor(Math.random() * kPieceShapes[index].orientations.length),
    position: {
      // row: 0,
      row: Math.round((kGridRows - kPieceShapes[index].size) / 2),
      col: Math.round((kGridCols - kPieceShapes[index].size + 1) / 2),
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

function draw({context, gameState: {grid, piece}}) {
  context.clearRect(0, 0, kWidthPx, kHeightPx);

  context.reset();
  context.translate((kWidthPx - kGridWidthPx) / 2, (kHeightPx - kGridHeightPx) / 2);

  context.lineWidth = 2;
  context.strokeStyle = '#555';
  for (let y = 0; y <= kGridHeightPx; y += kCellSizePx) {
    for (let x = 0; x <= kGridWidthPx; x += kCellSizePx) {
      context.strokeRect(x, y, kCellSizePx, kCellSizePx);
    }
  }

  const pieceShape = kPieceShapes[piece.index];
  context.fillStyle = pieceShape.colour;
  context.strokeStyle = '#0003';
  const pieceOrientation = pieceShape.orientations[piece.orientationIndex];
  for (let row = 0; row < pieceShape.size; ++row) {
    for (let col = 0; col < pieceShape.size; ++col) {
      if (pieceOrientation[row][col] !== ' ') {
        const x = (piece.position.col + col) * kCellSizePx;
        const y = (piece.position.row + row) * kCellSizePx;
        context.fillRect(x, y, kCellSizePx, kCellSizePx);
        context.strokeRect(x, y, kCellSizePx, kCellSizePx);
      }
    }
  }
}

main();
