export function log(text) {
  output.textContent += text + '\n';
}

export function clearLog() {
  output.textContent = '';
}

export function random(x) {
  return Math.random() * x;
}

export function deviate(x) {
  return random(2 * x) - x;
}

export function randomLow(x) {
  return Math.random() ** 2 * x;
}

export function randomRange(a, b) {
  return a + random(b - a);
}

export function randomRangeLow(a, b) {
  return a + randomLow(b - a);
}

export function pickRandom(list) {
  return list[Math.floor(random(list.length))];
}

export class Grid {
  constructor(width, height, cellSize) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.cols = Math.ceil(width / cellSize);
    this.rows = Math.ceil(height / cellSize);
    this.cells = [];
    for (let i = 0; i < this.rows * this.cols; ++i) {
      this.cells.push([]);
    }
  }
  
  clear() {
    for (const cell of this.cells) {
      cell.length = 0;
    }
  }
  
  xCol(x) {
    return Math.floor(Math.min(this.width, Math.max(0, x)) / this.cellSize);
  }
  
  yRow(y) {
    return Math.floor(Math.min(this.height, Math.max(0, y)) / this.cellSize);
  }
  
  *query(x, y, radius) {
    const endCol = this.xCol(x + radius);
    const endRow = this.yRow(y + radius);
    for (let col = this.xCol(x - radius); col <= endCol; ++col) {
      for (let row = this.yRow(y - radius); row <= endRow; ++row) {
        yield this.cells[col + row * this.cols];
      }
    }
  }
  
  insert(x, y, radius, item) {
    const endCol = this.xCol(x + radius);
    const endRow = this.yRow(y + radius);
    for (let col = this.xCol(x - radius); col <= endCol; ++col) {
      for (let row = this.yRow(y - radius); row <= endRow; ++row) {
        this.cells[col + row * this.cols].push(item);
      }
    }
  }
}