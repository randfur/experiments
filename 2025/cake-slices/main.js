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

  const dots = range(100).map(i => new Vec3(deviate(1), deviate(1), deviate(1)));

  while (true) {
    const time = await new Promise(requestAnimationFrame);
    Temp.reclaimAll();
    hexLines.clear();

    Mat4.temp().setMultiply(
      Mat4.temp().setTranslateXyz(0, 0, 300),
      Mat4.temp().setRotateRotor(
        Rotor3.temp().setAxisAngle(
          Vec3.temp(0, 1, 0),
          time / 1000,
          // TAU / 4,
        ),
      ),
    ).exportToArrayBuffer(hexLines.transformMatrix);

    const position = Vec3.temp(
      100 * Math.cos(3 + time / 8000),
      100 * Math.cos(20 + time / 6000),
      100 * Math.cos(12 + time / 7000),
    );
    const otherPosition = Vec3.temp(
      100 * Math.cos(8 + time / 4000),
      100 * Math.cos(2 + time / 2000),
      100 * Math.cos(9 + time / 3000),
    );
    const normal = Vec3.temp().setDelta(position, otherPosition).inplaceNormalise();

    // box.draw(hexLines);

    // hexLines.addDot({position, colour: {r: 255}, size: 20});
    // hexLines.addPoint({position, colour: {r: 255}, size: 10});
    // hexLines.addPoint({position: Vec3.temp().setScaleAdd(position, 100, normal), colour: {r: 255, g: 200}, size: 10});
    // hexLines.addNull()

    for (const dot of dots) {
      dot.inplaceScaleAdd(0.2, Vec3.temp(Math.cos(dot.y), Math.cos(dot.z), Math.cos(dot.x)));
      hexLines.addDot({
        position: dot,
        colour: {r: 200, b: 180},
        size: 10,
      });
      hexLines.addDot({
        position: Vec3.temp().setPlaneProjection(position, normal, dot),
        colour: {r: 100, b: 255},
        size: 10,
      });
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