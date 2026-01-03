import {HexLinesContext} from '../../third-party/hex-lines/src/hex-lines.js';
import {Ship} from './ship.js';

async function main() {
  let {hexLinesContext} = HexLinesContext.setupFullPageContext({is3d: true});
  let hexLines = hexLinesContext.createLines();

  let objects = initialScene();

  while (true) {
    const time = await new Promise(requestAnimationFrame);

    for (const object of objects) {
      object.update(objects);
    }
    objects = objects.filter(object => object.alive);

    hexLines.clear();
    for (const object of objects) {
      object.draw(hexLines);
    }
    hexLines.transformMatrix = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 500, 1,
    ];
    hexLines.draw();
  }
}

function initialScene() {
  const objects = [];
  const count = 20;
  for (let i = 0; i < count; ++i) {
    objects.push(new Ship(i / (count - 1)));
  }
  return objects;
}

main();