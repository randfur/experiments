export function findCollidingCell(cell, potentialNumber, gameCells) {
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

export function select(keyedPromises) {
  return Promise.race(Object.entries(keyedPromises).map(([key, promise]) => promise.then(value => ({key, value}))));
}


export function randomiseList(list) {
  list.sort(() => Math.random() - 0.5);
}

export function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}