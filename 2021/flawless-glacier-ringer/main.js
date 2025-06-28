let board = null;
const rows = 6;
const columns = 7;

function range(n) {
  const result = [];
  for (let i = 0; i < n; ++i) {
    result.push(i);
  }
  return result;
}

function* enumerate(list) {
  for (let i = 0; i < list.length; ++i) {
    yield [i, list[i]];
  }
}

function initBoard() {
  board = {
    rows: [],
    nextRowForColumn: [],
  };
  for (const _ of range(rows)) {
    board.rows.push(range(columns).map(_ => ' '));
  }
  board.nextRowForColumn = range(columns).map(_ => rows - 1);
}

function printBoard() {
  print('--------------');
  for (const [i, row] of enumerate(board.rows)) {
    print(`${i}> ${row.join('')}`);
  }
}

function insertPiece(piece, column) {
  const rowIndex = board.nextRowForColumn[column]--;
  if (rowIndex >= 0) {
    board.rows[rowIndex][column] = piece;
    return rowIndex;
  }
  return null;
}

function clear() {
  document.getElementById('output').textContent = '';
}

function print(text) {
  document.getElementById('output').textContent += text + '\n';
}

function inBoard(row, column) {
  return row >= 0 && row < rows && column >= 0 && column < columns;
}

function countPiecesInDirection(piece, row, column, dRow, dColumn) {
  let count = 0;
  while (true) {
    row += dRow;
    column += dColumn;
    if (!inBoard(row, column))
      break;
    if (board.rows[row][column] != piece)
      break;
    ++count;
  }
  return count;
}

function moveWon(piece, row, column) {
  const directions = [
    { dColumn: 0, dRow: -1, },
    { dColumn: 1, dRow: -1, },
    { dColumn: 1, dRow: 0, },
    { dColumn: 1, dRow: 1, },
  ];
  for (const {dRow, dColumn} of directions) {
    const count = 1 +
        countPiecesInDirection(piece, row, column, dRow, dColumn) +
        countPiecesInDirection(piece, row, column, -dRow, -dColumn);
    console.log(count);
    if (count >= 4)
      return true;
  }
  return false;
}

async function main() {
  const xMoves = [0, 1, 1, 2, 2, 2, 3, 3, 3, 3];
  const oMoves = [1, 2, 3, 4];
  const players = [{
    piece: 'x',
    getColumn: function() {
      return Math.floor(Math.random() * columns);
      // return xMoves.shift();
    },
  }, {
    piece: 'o',
    getColumn: function() {
      return Math.floor(Math.random() * columns);
    },
  }];
  
  const turns = 5;
  
  initBoard();
  let running = true;
  while (running) {
    for (const {piece, getColumn} of players) {
      await new Promise(resolve => {
        setTimeout(resolve, 1);
      });
      const column = getColumn();
      const row = insertPiece(piece, column);
      clear();
      printBoard();
      if (row != null && moveWon(piece, row, column)) {
        running = false;
        break;
      }
    }
  }
}
main();