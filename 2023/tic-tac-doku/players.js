import {findCollidingCell, select, randomiseList, pickRandom} from './utils.js';

export class OrganicPlayer {
  static async selectCells(playerTurn, poolCells, gameCells) {
    let poolCell = null;
    while (true) {
      const {key, value: cell} = await select({
        pool: poolCells.nextClick,
        game: gameCells.nextClick,
      });
      switch (key) {
        case 'pool': {
          if (cell.dataset.available !== 'true') {
            break;
          }
          if (poolCell) {
            delete poolCell.dataset.selected;
            delete poolCell.dataset.player;
          }
          poolCell = cell;
          poolCell.dataset.selected = true;
          poolCell.dataset.player = playerTurn;
          break;
        }
        case 'game': {
          const gameCell = cell;

          if (!poolCell) {
            break;
          }

          const collidingCell = findCollidingCell(gameCell, poolCell.textContent, gameCells);
          if (collidingCell) {
            collidingCell.animate([{backgroundColor: 'red'}, {}], {duration: 1000});
            break;
          }
          return {poolCell, gameCell};
        }
      }
    }
  }
}

export class ArtificialPlayer {
  static async selectCells(playerTurn, poolCells, gameCells) {
    const availablePoolCells = poolCells.filter(poolCell => poolCell.dataset.available === 'true');
    randomiseList(availablePoolCells);
    for (const poolCell of poolCells) {
      const validGameCells = gameCells.filter(gameCell => findCollidingCell(gameCell, poolCell.textContent, gameCells) === null);
      if (validGameCells.length > 0) {
        await new Promise(requestAnimationFrame);
        return {
          poolCell,
          gameCell: pickRandom(validGameCells),
        };
      }
    }
    console.warn('No valid moves detected, game should have been lost.');
  }
}

