import {HexLinesContext} from '../third-party/hex-lines/src/hex-lines.js';
import {Temp} from '../third-party/ga/temp.js';
import {Mat4} from '../third-party/ga/mat4.js';
import {Rotor3} from '../third-party/ga/rotor3.js';
import {Vec3} from '../third-party/ga/vec3.js';
import {PlaneBasis} from '../third-party/ga/plane-basis.js';
import {createBox} from './box.js';

const TAU = Math.PI * 2;

async function main() {
  const {hexLinesContext} = HexLinesContext.setupFullPageContext({is3d: true});
  const hexLines = hexLinesContext.createLines();

  const box = createBox(Vec3.temp(200, 300, 100), 10, {r: 255, g: 255, b: 255});

  while (true) {
    const time = await new Promise(requestAnimationFrame);
    Temp.reclaimAll();
    hexLines.clear();

    Mat4.temp().setTranslateXyz(0, 0, 400)
      .inplaceMultiplyRight(Mat4.temp().setRotateZx(time / 1800))
      .exportToArrayBuffer(hexLines.transformMatrix);

    const position = Vec3.temp(
      Math.cos(time / 800) * 90,
      Math.cos(time / 900) * 90,
      0,
    );
    const direction = Vec3.temp(
      0,
      0,
      1,
    );
    const angle = time / 1000;
    const cuts = [
      Vec3.temp().setPolarXy(angle + TAU * 0 / 5),
      Vec3.temp().setPolarXy(angle + TAU * 1 / 5),
      Vec3.temp().setPolarXy(angle + TAU * 2 / 5),
      Vec3.temp().setPolarXy(angle + TAU * 3 / 5),
      Vec3.temp().setPolarXy(angle + TAU * 4 / 5),
    ];

    for (let i = 0; i < cuts.length; ++i) {
      const cut = cuts[i];
      const size = 10;
      const colour = {r: i / cuts.length * 255, b: 255};
      hexLines.addPoint({
        position,
        size,
        colour,
      })
      hexLines.addPoint({
        position: Vec3.temp().setScaleAdd(position, 140, cut),
        size,
        colour,
      })
      hexLines.addNull();
    }

    const parts = box.slice({
      position,
      direction,
      cuts,
      distance: 40,
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