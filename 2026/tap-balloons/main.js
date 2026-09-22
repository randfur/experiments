import {HexLinesContext} from '../../third-party/hex-lines/src/hex-lines.js';
import {Game} from './game.js';
import {cleanUpList} from './utils.js';

async function main() {
  const {hexLinesContext, width, height} = HexLinesContext.setupFullPageContext({
    is3d: true,
    pixelSize: 3,
    enableContextMenu: false,
  });
  const hexLines = hexLinesContext.createLines();

  let entities = [];
  function add(entity) {
    entities.push(entity);
  }

  entities.push(new Game(entities, width, height));

  let lastTime = 0;
  while (true) {
    const time = await new Promise(requestAnimationFrame);
    const timeDelta = Math.min(1000 / 30, time - lastTime);
    lastTime = time;

    for (const entity of entities) {
      if (entity.alive) {
        entity.update(time, timeDelta);
      }
    }

    cleanUpList(entities, entity => entity.alive, entity => entity.destroy?.());

    hexLines.clear();
    for (const entity of entities) {
      entity.draw?.(hexLines);
    }
    hexLines.draw();
  }
}

main();