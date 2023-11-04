export class Rows {
  static init(poolCells) {
    for (let i = 0; i < 81; ++i) {
      const cell = poolCells[i];
      cell.textContent = Math.floor(i / 9) + 1;
      cell.dataset.available = cell.textContent === '1';
    }
  }

  static updateAvailable(poolCells) {
    if (poolCells.some(cell => cell.dataset.available === 'true')) {
      return;
    }
    let nextNumber = null;
    for (const cell of poolCells) {
      if (cell.textContent !== '' && nextNumber === null) {
        nextNumber = cell.textContent;
      }
      if (nextNumber && cell.textContent === nextNumber) {
        cell.dataset.available = true;
      }
    }
  }
}

export class Rounds {
  static init(poolCells) {
    for (let i = 0; i < 81; ++i) {
      const cell = poolCells[i];
      cell.textContent = i % 9 + 1;
      cell.dataset.available = i < 9;
    }
  }

  static updateAvailable(poolCells) {
    if (poolCells.some(cell => cell.dataset.available === 'true')) {
      return;
    }
    let nextRow = null;
    for (let i = 0; i < 81; ++i) {
      const cell = poolCells[i];
      if (cell.textContent !== '' && nextRow === null) {
        nextRow = Math.floor(i / 9);
      }
      if (Math.floor(i / 9) === nextRow) {
        cell.dataset.available = true;
      }
    }
  }
}

export class OrderedRounds {
  static init(poolCells) {
    for (let i = 0; i < 81; ++i) {
      const cell = poolCells[i];
      cell.textContent = i % 9 + 1;
      cell.dataset.available = i === 0;
    }
  }

  static updateAvailable(poolCells) {
    for (const cell of poolCells) {
      if (cell.textContent !== '') {
        cell.dataset.available = true;
        return;
      }
    }
  }
}

export class FreeForAll {
  static init(poolCells) {
    for (let i = 0; i < 81; ++i) {
      const cell = poolCells[i];
      cell.textContent = Math.floor(i / 9) + 1;
      cell.dataset.available = true;
    }
  }

  static updateAvailable(poolCells) {}
}

export class RandomSequence {
  static init(poolCells) {
    const numberList = [];
    for (let i = 0; i < 81; ++i) {
      numberList.push(i % 9 + 1);
    }
    numberList.sort(() => Math.random() - 0.5);

    for (let i = 0; i < 81; ++i) {
      const cell = poolCells[i];
      cell.textContent = numberList[i];
      cell.dataset.available = i === 0;
    }
  }

  static updateAvailable(poolCells) {
    for (const cell of poolCells) {
      if (cell.textContent !== '') {
        cell.dataset.available = true;
        return;
      }
    }
  }
}

