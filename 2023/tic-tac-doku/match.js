import {gameCells, poolCells} from './cells.js';

/*
interface GameMode {
  init(poolCells);
}
*/

export class Match {
  constructor(mode) {
    this.mode = mode;

    for (const cell of [...gameCells, ...poolCells]) {
      cell.textContent = '';
      for (const key in cell.dataset) {
        delete cell.dataset[key];
      }
    }

    gameStatus.textContent = '';

    this.mode.init(poolCells);

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

    this.mode.updateAvailable(poolCells);

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

    if (gameCells.every(cell => cell.textContent !== '')) {
      delete gameStatus.dataset.player;
      gameStatus.textContent = 'Game over: Sudoku solved! Both players win!';
      return;
    }

    if (poolCells.every(poolCell =>
          poolCell.dataset.available !== 'true' ||
          gameCells.every(gameCell => this.findCollidingCell(gameCell, poolCell.textContent) !== null)
        )) {
      gameStatus.textContent = `Game over: No remaining moves. Player ${this.playerTurn + 1} wins!`;
      return;
    }

    this.playerTurn = (this.playerTurn + 1) % 2;
    gameStatus.dataset.player = this.playerTurn;
    gameStatus.textContent = `Player ${this.playerTurn + 1}'s turn`;
  }

  findCollidingCell(cell, potentialNumber) {
    if (cell.textContent !== '') {
      return cell;
    }

    const index = gameCells.indexOf(cell);
    const gridX = index % 9;
    const gridY = Math.floor(index / 9);
    const subGridX = Math.floor(gridX / 3) * 3;
    const subGridY = Math.floor(gridY / 3) * 3;
    for (let i = 0; i < 9; ++i) {
      const otherCells = [
        gameCells[i * 9 + gridX],
        gameCells[gridY * 9 + i],
        gameCells[(subGridY + Math.floor(i / 3)) * 9 + (subGridX + (i % 3))],
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

