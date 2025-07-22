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

    const [modelA, modelB] = model.slice({
      position: new Vec3(0, 20, 500),
      normal: new Vec3(
        1,
        2 * Math.cos(time / 1000),
        4 * Math.sin(time / 1000),
      ).inplaceNormalise(),
      push: new Vec3(0, 200, 0),
    });
    modelA.draw(hexLines);
    modelB.draw(hexLines);
    hexLines.draw();
    hexLines.clear();
    Temp.reclaimAll();
  }
}

main();