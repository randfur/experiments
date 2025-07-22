import {HexLinesContext} from '../third-party/hex-lines/src/hex-lines.js';
import {createBox} from './model.js';
import {Vec3} from '../third-party/ga/vec3.js';
import {Temp} from '../third-party/ga/temp.js';

async function main() {
  const {hexLinesContext} = HexLinesContext.setupFullPageContext({is3d: true});
  const hexLines = hexLinesContext.createLines();

  const model = createBox({
    position: new Vec3(0, 0, 600),
    size: new Vec3(200, 400, 200),
  });

  while (true) {
    const time = await new Promise(requestAnimationFrame);
    model.draw(hexLines);
    hexLines.draw();
    hexLines.clear();
    Temp.reclaimAll();
  }
}

main();