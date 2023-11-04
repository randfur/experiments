export class Match {
  constructor(mode, gameCells, poolCells) {
    this.mode = mode;
    this.gameCells = gameCells;
    this.poolCells = poolCells;

    for (const cell of [...this.gameCells, ...this.poolCells]) {
      cell.textContent = '';
      for (const key in cell.dataset) {
        delete cell.dataset[key];
      }
    }

    gameStatus.textContent = '';

    this.mode.init(this.poolCells);

    this.playerTurn = -1;
    this.selectedCell = null;
    this.startNextTurn();
  }

  poolCellChosen(cell) {
    if (cell.dataset.available !== 'true') {
      return;
    }
    this.clearSelectedCell();
    cell.dataset.selected = true;
    cell.dataset.player = this.playerTurn;
    this.selectedCell = cell;
  }

  gameCellChosen(cell) {
    if (this.selectedCell === null) {
      return;
    }

    const collidingCell = this.findCollidingCell(cell, this.selectedCell.textContent);
    if (collidingCell) {
      collidingCell.animate([{backgroundColor: 'red'}, {}], {duration: 1000});
      return;
    }

    cell.textContent = this.selectedCell.textContent;
    cell.dataset.player = this.playerTurn;
    this.selectedCell.textContent = '';
    this.selectedCell.dataset.available = false;
    this.selectedCell.dataset.used = true;

    this.mode.updateAvailable(this.poolCells);

    this.startNextTurn();
  }

  clearSelectedCell() {
    if (this.selectedCell) {
      delete this.selectedCell.dataset.selected;
      delete this.selectedCell.dataset.player;
    }
    this.selectedCell = null;
  }

  startNextTurn() {
    this.clearSelectedCell();

    if (this.gameCells.every(cell => cell.textContent !== '')) {
      delete gameStatus.dataset.player;
      gameStatus.textContent = 'Game over: Sudoku solved! Both players win!';
      return;
    }

    const noMovesAvailable = this.poolCells.every(poolCell =>
      poolCell.dataset.available !== 'true' ||
      this.gameCells.every(gameCell => this.findCollidingCell(gameCell, poolCell.textContent) !== null)
    );

    if (noMovesAvailable) {
      gameStatus.textContent = `Game over: No remaining moves. Player ${this.playerTurn + 1} wins!`;
    }

    this.playerTurn = (this.playerTurn + 1) % 2;
    if (!noMovesAvailable) {
      gameStatus.dataset.player = this.playerTurn;
      gameStatus.textContent = `Player ${this.playerTurn + 1}'s turn.`;
    }
  }

  findCollidingCell(cell, potentialNumber) {
    if (cell.textContent !== '') {
      return cell;
    }

    const index = this.gameCells.indexOf(cell);
    const gridX = index % 9;
    const gridY = Math.floor(index / 9);
    const subGridX = Math.floor(gridX / 3) * 3;
    const subGridY = Math.floor(gridY / 3) * 3;
    for (let i = 0; i < 9; ++i) {
      const otherCells = [
        this.gameCells[i * 9 + gridX],
        this.gameCells[gridY * 9 + i],
        this.gameCells[(subGridY + Math.floor(i / 3)) * 9 + (subGridX + (i % 3))],
      ];
      for (const otherCell of otherCells) {
        if (potentialNumber === otherCell.textContent) {
          return otherCell;
        }
      }
    }

    return null;
  }
}

