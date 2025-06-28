const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const width = window.innerWidth;
const height = window.innerHeight;

const boardSize = 8;
const cellSizePx = 64;
const pieceSizePx = 32;

const kBlack = 'black';
const kWhite = 'white';

let gameState = null;

async function main() {
  canvas.width = width;
  canvas.height = height;

  gameState = newGame();
  canvas.addEventListener('mousedown', mouseDownEvent);
  drawBoard();
}
main();

function newGame() {
  const pieceGrid = [];
  for (let row = 0; row < boardSize; ++row) {
    const rowPieces = [];
    for (let col = 0; col < boardSize; ++col) {
      if (row < 2 || row >= boardSize - 2) {
        rowPieces.push({
          colour: row < boardSize / 2 ? kBlack : kWhite,
          value: 1,
        });
      } else {
        rowPieces.push(null);
      }
    }
    pieceGrid.push(rowPieces);
  }
  return {
    pieceGrid,
    selected: null,
    currentPlayer: kWhite,
  };
}

function drawBoard() {
  context.clearRect(0, 0, width, height);
  context.font = '12px sans-serif';
  for (let row = 0; row < boardSize; ++row) {
    for (let col = 0; col < boardSize; ++col) {
      const [x, y] = [col * cellSizePx, row * cellSizePx];

      // Cell
      if (gameState.selected?.row === row && gameState.selected?.col === col) {
        context.fillStyle = '#0f04';
        context.fillRect(x, y, cellSizePx, cellSizePx);
      } else if ((row + col) % 2 == 1) {
        context.fillStyle = '#e704';
        context.fillRect(x, y, cellSizePx, cellSizePx);
      }
      context.strokeStyle = 'black';
      context.strokeRect(x, y, cellSizePx, cellSizePx);

      // Piece
      const piece = gameState.pieceGrid[row][col];
      if (!piece) {
        continue;
      }
      context.fillStyle = piece.colour;
      context.fillRect(
          x + (cellSizePx - pieceSizePx) / 2,
          y + (cellSizePx - pieceSizePx) / 2,
          pieceSizePx,
          pieceSizePx);
      context.strokeStyle = oppositeColour(piece.colour);
      context.strokeRect(
          x + (cellSizePx - pieceSizePx) / 2,
          y + (cellSizePx - pieceSizePx) / 2,
          pieceSizePx,
          pieceSizePx);
      context.fillStyle = oppositeColour(piece.colour);
      context.fillText(piece.value, x + cellSizePx / 2 - 4, y + cellSizePx / 2 + 4);
    }
  }
  
  context.font = '20px sans-serif';
  context.fillStyle = 'grey';
  context.fillText(`Turn: ${gameState.currentPlayer}`, boardSize * cellSizePx + 10, boardSize / 2 * cellSizePx);
}

function oppositeColour(colour) {
  return colour === kBlack ? kWhite : kBlack;
}

function mouseDownEvent(event) {
  const row = Math.floor(event.offsetY / cellSizePx);
  const col = Math.floor(event.offsetX / cellSizePx);
  if (row < 0 || row >= boardSize || col < 0 || col >= boardSize) {
    return;
  }
  const piece = gameState.pieceGrid[row][col];
  if (gameState.selected) {
    if (piece === gameState.selected.piece) {
      gameState.selected.piece.value = Math.ceil(Math.random() * 6);
      gameState.selected = null;

      maybeFight(row, col, gameState.currentPlayer);
      
      gameState.currentPlayer = oppositeColour(gameState.currentPlayer);
      drawBoard();
      return;
    }
    if (piece) {
      if (piece.colour === gameState.selected.piece.colour) {
        gameState.selected = {piece, row, col};
        drawBoard();
        return;
      }
      return;
    }
    if (Math.abs(gameState.selected.row - row) <= 1 && Math.abs(gameState.selected.col - col) <= 1) {
      gameState.pieceGrid[gameState.selected.row][gameState.selected.col] = null;
      gameState.pieceGrid[row][col] = gameState.selected.piece;
      gameState.selected = null;
      
      maybeFight(row, col, gameState.currentPlayer);

      gameState.currentPlayer = oppositeColour(gameState.currentPlayer);
      drawBoard();
      return;
    }
    return;
  }
  if (piece && piece.colour === gameState.currentPlayer) {
    gameState.selected = {piece, row, col};
    drawBoard();
    return;
  }
}

function maybeFight(attackerRow, attackerCol, attackerColour) {
  const attackers = floodFind(attackerRow, attackerCol, attackerColour);
  const attackValue = sumFloodFindResults(attackers);
  const defenderColour = oppositeColour(attackerColour);
  const toRemoveList = [];
  for (const attacker of attackers) {
    for (const [adjacentRow, adjacentCol] of adjacentPositions(attacker.row, attacker.col)) {
      const adjacentPiece = gameState.pieceGrid[adjacentRow][adjacentCol];
      if (adjacentPiece?.colour !== defenderColour) {
        continue;
      }
      const defenceValue = sumFloodFindResults(floodFind(adjacentRow, adjacentCol, defenderColour));
      if (defenceValue < attackValue) {
        toRemoveList.push({
          row: adjacentRow,
          col: adjacentCol,
        });
      } else if (defenceValue > attackValue) {
        toRemoveList.push({
          row: attacker.row,
          col: attacker.col,
        });
      }
    }
  }
  for (const toRemove of toRemoveList) {
    gameState.pieceGrid[toRemove.row][toRemove.col] = null;
  }
}

function floodFind(row, col, colour) {
  const results = [];
  const found = new Set();
  function traverse(row, col) {
    const piece = gameState.pieceGrid[row][col];
    if (piece?.colour === colour) {
      if (!found.has(piece)) {
        found.add(piece);
        results.push({row, col, piece});
        for (const [adjacentRow, adjacentCol] of adjacentPositions(row, col)) {
          traverse(adjacentRow, adjacentCol);
        }
      }
    }
  }
  traverse(row, col);
  return results;
}

function* adjacentPositions(row, col) {
  for (let i = -1; i <= 1; ++i) {
    for (let j = -1; j <= 1; ++j) {
      if ((i === 0) === (j === 0)) {
        continue;
      }
      const adjacentRow = row + i;
      const adjacentCol = col + j;
      if (adjacentRow < 0 || adjacentRow >= boardSize || adjacentCol < 0 || adjacentCol >= boardSize) {
        continue;
      }
      yield [adjacentRow, adjacentCol];
    }
  }
}

function sumFloodFindResults(results) {
  let result = 0;
  for (const {piece} of results) {
    result += piece.value;
  }
  return result;
}