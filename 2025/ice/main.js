import {HexLinesContext} from './third-party/hex-lines/src/hex-lines.js';
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
    hexLines.draw();
  }
}

function initialScene() {
  const objects = [];
  for (let i = 0; i < 200; ++i) {
    objects.push(new Ship());
  }
  return objects;
}

main();