import {HexLinesContext} from '../third-party/hex-lines/src/hex-lines.js';
import {Temp} from '../third-party/ga/temp.js';
import {Mat4} from '../third-party/ga/mat4.js';
import {Rotor3} from '../third-party/ga/rotor3.js';
import {Vec3} from '../third-party/ga/vec3.js';
import {createBox} from './model.js';

const TAU = Math.PI * 2;

async function main() {
  const {hexLinesContext} = HexLinesContext.setupFullPageContext({is3d: true});
  const hexLines = hexLinesContext.createLines();

  const box = createBox(Vec3.temp(100, 400, 200), 10, {r: 255, g: 255, b: 255});
  // const [partA, partB] = box.split(
  //   Vec3.temp(0, 50, -50),
  //   Vec3.temp(1, 1, 1).inplaceNormalise(),
  // );

  while (true) {
    const time = await new Promise(requestAnimationFrame);
    Temp.reclaimAll();
    Mat4.temp().setMultiply(
      Mat4.temp().setTranslateXyz(0, 0, 500),
      Mat4.temp().setRotateRotor(
        Rotor3.temp().setAxisAngle(
          Vec3.temp(0, 1, 0),
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