function main() {
  const output = document.createElement('pre');
  document.body.append(output);
  function print(text) {
    output.textContent += (text ?? '') + '\n';
  }

  const stringA = 'dogdogdog';
  const stringB = 'dogcatcatdog';

  print('Input strings:');
  print(stringA);
  print(stringB);
  print();

  print('Minimal edit DP grid:');
  const grid = computeMinimalEditGrid(stringA, stringB);
  print(grid.toString());

  print('Minimal edits:');
  for (const minimalEdit of computeMinimalEdits(stringA, stringB)) {
    print(`A: ${minimalEdit.a}\nB: ${minimalEdit.b}\n`);
  }
}

function computeMinimalEdits(stringA, stringB) {
  const grid = computeMinimalEditGrid(stringA, stringB);
  function recurse(row, col) {
    if (row === 0) {
      return [{
        a: '',
        b: stringB.substring(0, col - 1),
      }];
    }
    if (col === 0) {
      return [{
        a: stringA.substring(0, row - 1),
        b: '',
      }];
    }
    const top = grid.get(row - 1, col) + 1;
    const topLeft = grid.get(row - 1, col - 1) + (stringA[row - 1] === stringB[col - 1] ? 0 : 1);
    const left = grid.get(row, col - 1) + 1;
    const min = Math.min(top, topLeft, left);
    return [
      ...(top === min ? recurse(row - 1, col).map(minimalEdit => {
        return {
          a: minimalEdit.a + stringA[row - 1],
          b: minimalEdit.b + '-',
        };
      }) : []),
      ...(topLeft === min ? recurse(row - 1, col - 1).map(minimalEdit => {
        return {
          a: minimalEdit.a + stringA[row - 1],
          b: minimalEdit.b + stringB[col - 1],
        };
      }) : []),
      ...(left === min ? recurse(row, col - 1).map(minimalEdit => {
        return {
          a: minimalEdit.a + '-',
          b: minimalEdit.b + stringB[col - 1],
        };
      }) : []),
    ];
  }
  return recurse(grid.rows - 1, grid.cols - 1);
}

function computeMinimalEditGrid(stringA, stringB) {
  const grid = createGrid(stringA, stringB);
  for (let row = 1; row < grid.rows; ++row) {
    for (let col = 1; col < grid.cols; ++col) {
      const top = grid.get(row - 1, col);
      const topLeft = grid.get(row - 1, col - 1);
      const left = grid.get(row, col - 1);
      grid.set(row, col, Math.min(
        top + 1,
        left + 1,
        topLeft + (stringA[row - 1] === stringB[col - 1] ? 0 : 1),
      ));
    }
  }
  return grid;
}

class Grid {
  constructor(rows, cols) {
    this.array = new Int8Array(rows * cols);
    this.rows = rows;
    this.cols = cols;
  }

  get(row, col) {
    return this.array[row * this.cols + col];
  }

  set(row, col, value) {
    this.array[row * this.cols + col] = value;
  }

  toString() {
    let result = '';
    for (let row = 0; row < this.rows; ++row) {
      for (let col = 0; col < this.cols; ++col) {
        result += this.get(row, col).toFixed().padStart(2, ' ') + ' ';
      }
      result += '\n';
    }
    return result;
  }
}

function createGrid(stringA, stringB) {
  const grid = new Grid(stringA.length + 1, stringB.length + 1);
  for (let row = 0; row < grid.rows; ++row) {
    grid.set(row, 0, row);
  }
  for (let col = 0; col < grid.cols; ++col) {
    grid.set(0, col, col);
  }
  return grid;
}

main();