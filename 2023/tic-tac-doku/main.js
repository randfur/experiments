import {Ordered, Rounds, OrderedRounds, FreeForAll, RandomSequence} from './game-modes.js';
import {OrganicPlayer, ArtificialPlayer} from './players.js';
import {Match} from './match.js';


function main() {
  let currentMatch = null;
  const gameCells = [];
  const poolCells = [];

  function createMatch(mode) {
    return new Match(
      mode,
      gameCells,
      poolCells,
      player0Oi.checked ? OrganicPlayer : ArtificialPlayer,
      player1Oi.checked ? OrganicPlayer : ArtificialPlayer,
    );
  }

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
      currentMatch.done = true;
      currentMatch = createMatch(mode);
    });
    modeButtonContainer.append(button, ' ');
  }

  for (const {cellList, container, eventName} of [
    {cellList: gameCells, container: gameGrid, eventName: 'gameCellChosen'},
    {cellList: poolCells, container: poolGrid, eventName: 'poolCellChosen'},
  ]) {
    cellList.nextClick = createResolvablePromise();
    for (let i = 0; i < 9; ++i) {
      const row = document.createElement('div');
      row.classList = 'row';
      for (let j = 0; j < 9; ++j) {
        const cell = document.createElement('div');
        cell.classList = 'cell';
        cell.addEventListener('click', () => {
          const promise = cellList.nextClick;
          cellList.nextClick = createResolvablePromise();
          promise.resolve(cell);
        });
        cellList.push(cell);
        row.append(cell);
      }
      container.append(row);
    }
  }

  currentMatch = createMatch(Ordered);
}

function createResolvablePromise() {
  let resolve = null;
  const promise = new Promise(r => resolve = r);
  promise.resolve = resolve;
  return promise;
}

main();