import {gameCells, pickCells} from './cells.js';

/*
interface GameMode {
  init(pickCells);
}
*/

export class Match {
  constructor(mode) {
    this.mode = mode;
    this.awaitingPickCell = true;
    this.awaitingGameCell = true;

    for (const cell of [...gameCells, ...pickCells]) {
      cell.style = '';
      cell.textContent = '';
    }

    gameStatus.textContent = '';
    inputFeedback.textContent = '';

    this.mode.init(pickCells);

    this.selectedPickCell = null;
  }

  pickCellSelected(cell) {
    if (cell.available) {
      cell.classList = ['selected'];
      this.selectedPickCell = cell;
    }
    cell.textContent = Math.ceil(Math.random() * 9);
  }

  gameCellSelected(cell) {
    cell.textContent = Math.ceil(Math.random() * 9);
  }
}

