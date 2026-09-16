import {HexLinesContext} from '../../third-party/hex-lines/src/hex-lines.js';
import {Game} from './game.js';

async function main() {
  const {hexLinesContext, width, height} = HexLinesContext.setupFullPageContext({
    is3d: false,
    pixelSize: 3,
  });
  const hexLines = hexLinesContext.createLines();

  const textCanvas = document.createElement('canvas');
  textCanvas.width = width;
  textCanvas.height = height;
  textCanvas.style.cssText = `
    position: absolute;
    left: 0px;
    top: 0px;
  `;
  document.body.append(textCanvas);
  const textContext = textCanvas.getContext('2d');

  let entities = [];
  function add(entity) {
    entities.push(entity);
  }
  entities.push(new Game(entities, width, height));

  let lastTime = performance.now();
  while (true) {
    const time = await new Promise(requestAnimationFrame);
    const timeDelta = Math.max(1000 / 30, time - lastTime);
    lastTime = time;

    for (const entity of entities) {
      entity.update(time, timeDelta);
    }

    let aliveIndex = 0;
    for (let i = 0; i < entities.length; ++i) {
      if (entities[i].alive) {
        entities[aliveIndex] = entities[i];
        ++aliveIndex;
      } else {
        entities[i].destroy?.();
      }
    }
    entities.length = aliveIndex;

    hexLines.clear();
    textContext.clearRect(0, 0, width, height);
    for (const entity of entities) {
      entity.draw(hexLines, textContext);
    }
    hexLines.draw();
  }
}

main();