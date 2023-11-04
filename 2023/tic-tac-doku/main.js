import {gameCells, pickCells} from './cells.js';
import {Rows} from './game-modes.js';
import {Match} from './match.js';


function main() {
  let currentMatch = null;

  const modes = [Rows];
  for (const mode of modes) {
    const button = document.createElement('button');
    button.textContent = mode.name;
    button.addEventListener('click', event => {
      currentMatch = new Match(mode);
    });
    modeButtonContainer.append(button);
  }

  for (const cell of pickCells) {
    cell.addEventListener('click', () => {
      if (currentMatch?.awaitingPickCell) {
        currentMatch.pickCellSelected(cell);
      }
    });
  }

  for (const cell of gameCells) {
    cell.addEventListener('click', () => {
      if (currentMatch?.awaitingGameCell) {
        currentMatch.gameCellSelected(cell);
      }
    });
  }
}

main();