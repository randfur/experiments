import {gameCells, poolCells} from './cells.js';
import {Ordered, Rounds, OrderedRounds, FreeForAll, RandomSequence} from './game-modes.js';
import {Match} from './match.js';


function main() {
  let currentMatch = null;

  const modes = [
    Ordered,
    Rounds,
    OrderedRounds,
    FreeForAll,
    RandomSequence,
  ];
  for (const mode of modes) {
    const button = document.createElement('button');
    button.textContent = mode.name;
    button.addEventListener('click', event => {
      currentMatch = new Match(mode);
    });
    modeButtonContainer.append(button, ' ');
  }

  for (const cell of poolCells) {
    cell.addEventListener('click', () => {
      currentMatch?.poolCellChosen(cell);
    });
  }

  for (const cell of gameCells) {
    cell.addEventListener('click', () => {
      currentMatch?.gameCellChosen(cell);
    });
  }

  currentMatch = new Match(Ordered);
}

main();