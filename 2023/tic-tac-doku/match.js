import {findCollidingCell} from './utils.js';

export class Match {
  constructor(mode, gameCells, poolCells, player0, player1) {
    this.done = false;

    for (const cell of [...gameCells, ...poolCells]) {
      cell.textContent = '';
      for (const key in cell.dataset) {
        delete cell.dataset[key];
      }
    }

    gameStatus.textContent = '';

    mode.init(poolCells);

    const players = [player0, player1];
    let playerTurn = -1;

    (async () => {
      while (!this.done) {
        if (gameCells.every(cell => cell.textContent !== '')) {
          delete gameStatus.dataset.player;
          gameStatus.textContent = 'Game over: Sudoku solved! Both players win!';
          return;
        }

        const noMovesAvailable = poolCells.every(poolCell =>
          poolCell.dataset.available !== 'true' ||
          gameCells.every(gameCell => findCollidingCell(gameCell, poolCell.textContent, gameCells) !== null)
        );
        if (noMovesAvailable) {
          gameStatus.textContent = `Game over: No remaining moves. Player ${playerTurn + 1} wins!`;
          return;
        }

        playerTurn = (playerTurn + 1) % 2;
        gameStatus.dataset.player = playerTurn;
        gameStatus.textContent = `Player ${playerTurn + 1}'s turn.`;

        const {poolCell, gameCell} = await players[playerTurn].selectCells(playerTurn, poolCells, gameCells);
        if (this.done) {
          return;
        }
        gameCell.textContent = poolCell.textContent;
        gameCell.dataset.player = playerTurn;
        gameCell.animate([{backgroundColor: 'orange'}, {}], {duration: 1000});
        poolCell.textContent = '';
        poolCell.dataset.available = false;
        poolCell.dataset.used = true;

        mode.updateAvailable(poolCells);
      }
      this.done = true;
    })();
  }
}

