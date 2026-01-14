import {HexLinesContext} from '../../third-party/hex-lines/src/hex-lines.js';
import {PlaneBasis} from '../../third-party/ga/plane-basis.js';
import {Vec3} from '../../third-party/ga/vec3.js';
import {Mat4} from '../../third-party/ga/mat4.js';

const TAU = Math.PI * 2;

async function main() {
  const {hexLinesContext} = HexLinesContext.setupFullPageContext();
  const hexLines = hexLinesContext.createLines();
  const sphereRight = new Sphere(new Vec3(300, 0, 100), 200);
  const sphereLeft = new Sphere(new Vec3(-300, 0, 100), 200);
  while (true) {
    const time = await new Promise(requestAnimationFrame);
    hexLines.clear();

    for (const i of range(10)) {
      drawHex({
        hexLines,
        planeBasis: sphereRight.createTangentPlane(
          Math.cos(i + time / 3000) * TAU,
          Math.sin(i + time / 8000) * TAU,
        ),
        radius: 100,
        size: 10,
        colour: {r: 255, g: 255, b: 255},
      });
    }

    for (const i of range(4)) {
      const up = i / 3;
      const count = (up > 0 && up < 1) ? 6 : 1;
      for (const j of range(count)) {
        drawHex({
          hexLines,
          planeBasis: sphereLeft.createTangentPlane(
            (j / Math.max(count - 1, 1)) * TAU,
            up * 0.5 * TAU,
          ),
          radius: 100,
          size: 10,
          colour: {r: 255, g: 255, b: 255},
        });
      }
    }

    // new Mat4().exportToArrayBuffer(hexLines.transformMatrix);
    hexLines.draw();
  }
}

class Sphere {
  constructor(origin, radius) {
    this.origin = origin;
    this.radius = radius;
  }

  createTangentPlane(angleXy, angleZ) {
    const normal = new Vec3().setSpherical(angleXy, angleZ, 1);
    return new PlaneBasis().set(
      new Vec3().setScaleAdd(this.origin, this.radius, normal),
      normal,
      new Vec3(1, 0, 0),
    );
  }
}

function drawHex({hexLines, planeBasis, radius, size, colour}) {
  hexLines.addPoints(range(7).map(i => ({
    position: new Vec3(
        radius * Math.cos(i / 6 * TAU),
        radius * Math.sin(i / 6 * TAU),
      ).inplace3dPlanePosition(planeBasis),
    size,
    colour,
  })));
  hexLines.addNull();
}

function range(n) {
  const result = [];
  for (let i = 0; i < n; ++i) {
    result.push(i);
  }
  return result;
}

main();