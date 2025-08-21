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

  const box = createBox(Vec3.temp(200, 400, 100), 10, {r: 255, g: 255, b: 255});

  while (true) {
    const time = await new Promise(requestAnimationFrame);
    Temp.reclaimAll();
    hexLines.clear();

    Mat4.temp()
      .setTranslateXyz(0, 0, 300)
      .exportToArrayBuffer(hexLines.transformMatrix);

    const parts = box.split({
      position: Vec3.temp(0, 0, 0),
      direction: Vec3.temp(0, 0, 1),
      cuts: [
        Vec3.temp().setPolarXy(time / 1000),
        Vec3.temp().setPolarXy(1 + time / 2000),
        Vec3.temp().setPolarXy(2 + time / 3000),
      ],
      distance: Math.abs(Math.cos(time / 4000)),
    });

    for (const part of parts) {
      part.draw(hexLines);
    }

    hexLines.draw();
  }
}

function deviate(x) {
  return x * (Math.random() * 2 - 1);
}

function range(n) {
  const result = [];
  for (let i = 0; i < n; ++i) {
    result.push(i);
  }
  return result;
}

main();