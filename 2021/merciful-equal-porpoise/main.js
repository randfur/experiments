const width = innerWidth;
const height = innerHeight;
const context = canvas.getContext('2d');
const cellSize = 24;
const boardWidth = Math.ceil(width / cellSize);
const boardHeight = Math.ceil(height / cellSize);

function mapping(x, y) {
  return 2 ** x * (2 * y + 1) - 1;
}

async function main() {
  canvas.width = width;
  canvas.height = height;

  const boardValues = [];
  for (let x = 0; x < boardWidth; ++x) {
    const column = [];
    for (let y = 0; y < boardHeight; ++y) {
      column.push(mapping(x, y));
    }
    boardValues.push(column);
  }

  context.fillRect(0, 0, width, height);
  context.fillStyle = '#4f2';
  context.globalCompositeOperation = 'screen';
  context.fillText('f(x, y) -> 2 ** x * (2 * y + 1) - 1', 0, 10);
  for (let x = 0; x < boardWidth; ++x) {
    for (let y = 0; y < boardHeight; ++y) {
      const value = boardValues[x][y];
      context.fillText(value, x * cellSize, (y + 1) * cellSize);
    }
  }
}
main();