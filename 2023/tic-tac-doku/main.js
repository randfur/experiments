import {Ordered, Rounds, OrderedRounds, FreeForAll, RandomSequence} from './game-modes.js';
import {Match} from './match.js';


function main() {
  let currentMatch = null;
  const gameCells = [];
  const poolCells = [];

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
      currentMatch = new Match(mode, gameCells, poolCells);
    });
    modeButtonContainer.append(button, ' ');
  }

  for (const {cellList, container, eventName} of [
    {cellList: gameCells, container: gameGrid, eventName: 'gameCellChosen'},
    {cellList: poolCells, container: poolGrid, eventName: 'poolCellChosen'},
  ]) {
    for (let i = 0; i < 9; ++i) {
      const row = document.createElement('div');
      row.classList = 'row';
      for (let j = 0; j < 9; ++j) {
        const cell = document.createElement('div');
        cell.classList = 'cell';
        cell.addEventListener('click', () => {
          currentMatch?.[eventName](cell);
        });
        cellList.push(cell);
        row.append(cell);
      }
      container.append(row);
    }
  }

  currentMatch = new Match(Ordered, gameCells, poolCells);
}

main();