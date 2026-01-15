import {HexLinesContext} from '../../third-party/hex-lines/src/hex-lines.js';
import {PlaneBasis} from '../../third-party/ga/plane-basis.js';
import {Vec3} from '../../third-party/ga/vec3.js';
import {Mat4} from '../../third-party/ga/mat4.js';

const TAU = Math.PI * 2;

async function main() {
  const {hexLinesContext} = HexLinesContext.setupFullPageContext({is3d: true});
  const hexLines = hexLinesContext.createLines();
  const sphereLeft = new Sphere(new Vec3(-300, 0, 0), 250);
  const sphereRight = new Sphere(new Vec3(300, 0, 0), 200);
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
      const pole = i === 0 || i === 3;
      const count = pole ? 1 : 6;
      for (const j of range(count)) {
        drawHex({
          hexLines,
          planeBasis: sphereLeft.createTangentPlane(
            pole ? 0 : (j + (i === 2 ? 0.5 : 0)) / count * TAU,
            i / 6 * TAU,
            pole ? (i === 0 ? new Vec3(1, 0, 0) : new Vec3().setPolar(TAU / 12, 1)) : new Vec3(0, 0, 1),
          ),
          radius: 100,
          size: 10,
          colour: {r: 255, g: 255, b: 255},
        });
      }
    }

    new Mat4()
      .inplaceMultiplyLeft(
        new Mat4().setRotateYz(time / 10000 * TAU)
      )
      .inplaceMultiplyLeft(
        new Mat4().setRotateXy(0.125 * TAU)
      )
      .inplaceMultiplyLeft(
        new Mat4().setTranslateXyz(0, 0, 700)
      )
      .exportToArrayBuffer(hexLines.transformMatrix);
    hexLines.draw();
  }
}

class Sphere {
  constructor(origin, radius) {
    this.origin = origin;
    this.radius = radius;
  }

  createTangentPlane(angleXy, angleZ, guideXDirection) {
    const normal = new Vec3().setSpherical(angleXy, angleZ, 1);
    return new PlaneBasis().set(
      new Vec3().setScaleAdd(this.origin, this.radius, normal),
      normal,
      guideXDirection,
    );
  }
}

function drawHex({hexLines, planeBasis, radius, size, colour}) {
  hexLines.addPoints(range(7).map(i => {
    const angle = ((i + 0.5) / 6) * TAU;
    return {
      position: new Vec3(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
        ).inplace3dPlanePosition(planeBasis),
      size,
      colour,
    };
  }));
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