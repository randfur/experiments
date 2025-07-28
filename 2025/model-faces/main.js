import {HexLinesContext} from '../third-party/hex-lines/src/hex-lines.js';
import {Temp} from '../third-party/ga/temp.js';
import {createBox} from './model.js';

const TAU = Math.PI * 2;

async function main() {
  const {hexLinesContext} = HexLinesContext.setupFullPageContext({is3d: true});
  const hexLines = hexLinesContext.createLines();

  const box = createBox(Temp.vec3(100, 400, 200), 10, {r: 255, g: 255, b: 255});
  // const [partA, partB] = box.split(
  //   Temp.vec3(0, 50, -50),
  //   Temp.vec3(1, 1, 1).inplaceNormalise(),
  // );

  while (true) {
    const time = await new Promise(requestAnimationFrame);
    Temp.reclaimAll();
    Temp.mat4().setMultiply(
      Temp.mat4().setTranslateXyz(0, 0, 500),
      Temp.mat4().setRotateRotor(
        Temp.rotor3().setAxisAngle(
          Temp.vec3().setXyz(0, 1, 0),
          // time / 1000,
          TAU / 4,
        ),
      ),
    ).exportToArrayBuffer(hexLines.transformMatrix);
    box.draw(hexLines);
    // partA.draw(hexLines);
    // partB.draw(hexLines);
    hexLines.draw();
  }
}

main();