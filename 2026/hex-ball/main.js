import {HexLinesContext} from '../../third-party/hex-lines/src/hex-lines.js';
import {PlaneBasis} from '../../third-party/ga/plane-basis.js';
import {Vec3} from '../../third-party/ga/vec3.js';
import {Rotor3} from '../../third-party/ga/rotor3.js';
import {Mat4} from '../../third-party/ga/mat4.js';

const TAU = Math.PI * 2;

async function main() {
  const {hexLinesContext} = HexLinesContext.setupFullPageContext({is3d: true});
  const hexLines = hexLinesContext.createLines();
  const sphereRight = new Sphere(new Vec3(300, 0, 0), 200);

  const hexBall = new Model(createHexBallPoints({
    ballRadius: 350,
    hexRadius: 150,
    size: 10,
    colour: {r: 255, g: 255, b: 255},
  }));

  const key = new Key();
  const direction = new Vec3();

  while (true) {
    const time = await new Promise(requestAnimationFrame);
    hexLines.clear();

    const horizontal = key.down.ArrowLeft !== key.down.ArrowRight ? (key.down.ArrowLeft ? -1 : 1) : 0;
    direction.setXyz(
      horizontal * 1 / 2,
      (horizontal ? (Math.sqrt(3) / 2) : 1) * (key.down.ArrowDown ? -1 : 1) * ((key.down.ArrowUp || key.down.ArrowDown || horizontal) ? 1 : 0),
    );
    hexBall.translation.inplaceScaleAdd(20, direction);
    hexBall.orientation.inplaceMultiplyRight(
      Rotor3.vec3ToVec3(
        Vec3.set(direction).inplaceScale(0.05).inplaceAddXyz(0, 0, 1),
        Vec3.a.setZ(),
      )
    );
    hexBall.render(hexLines);

    // for (const i of range(10)) {
    //   drawHex({
    //     hexLines,
    //     planeBasis: sphereRight.createTangentPlane(
    //       Math.cos(i + time / 3000) * TAU,
    //       Math.sin(i + time / 8000) * TAU,
    //     ),
    //     radius: 100,
    //     size: 10,
    //     colour: {r: 255, g: 255, b: 255},
    //   });
    // }

    new Mat4()
      .inplaceMultiplyLeft(
        new Mat4().setRotateYz(0.8 * TAU / 4)
      )
      // .inplaceMultiplyLeft(
      //   new Mat4().setRotateXy(0.125 * TAU)
      // )
      .inplaceMultiplyLeft(
        new Mat4().setTranslateXyz(0, 0, 1700)
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

class Model {
  constructor(sourcePoints) {
    this.sourcePoints = sourcePoints;
    this.transformedPoints = sourcePoints.map(point => {
      const clone = structuredClone(point);
      if (clone !== null) {
        clone.position = point.position.clone();
      }
      return clone;
    });
    this.translation = new Vec3();
    this.scale = 1;
    this.orientation = new Rotor3();
    this.transformMatrix = new Mat4();
  }

  render(hexLines) {
    this.transformMatrix
      .setScale(this.scale)
      .inplaceMultiplyLeft(
        Mat4.rotateRotor(this.orientation)
      )
      .inplaceMultiplyLeft(
        Mat4.translateVec3(this.translation)
      );

    for (let i = 0; i < this.sourcePoints.length; ++i) {
      const sourcePoint = this.sourcePoints[i];
      if (sourcePoint === null) {
        continue;
      }
      const transformedPoint = this.transformedPoints[i];
      transformedPoint.position.setMultiplyMat4Vec3(this.transformMatrix, sourcePoint.position);
    }

    hexLines.addPoints(this.transformedPoints);
  }
}

class Key {
  constructor() {
    this.down = {};
    window.addEventListener('keydown', event => {
      this.down[event.code] = true;
    });
    window.addEventListener('keyup', event => {
      this.down[event.code] = false;
    });
  }
}

function createHexBallPoints({ballRadius, hexRadius, size, colour}) {
  const sphere = new Sphere(new Vec3(), ballRadius);

  function createPresetHexPoints(angleXy, angleZ, guideXDirection) {
    return createHexPoints({
      planeBasis: sphere.createTangentPlane(angleXy, angleZ, guideXDirection),
      radius: hexRadius,
      size,
      colour,
    });
  }

  return [
    ...createPresetHexPoints(0, 0, new Vec3(1, 0, 0)),
    ...range(6).flatMap(i =>
      createPresetHexPoints(
        i / 6 * TAU,
        1 / 3 / 2 * TAU,
        new Vec3(0, 0, 1),
      )
    ),
    ...range(6).flatMap(i =>
      createPresetHexPoints(
        (i + 0.5) / 6 * TAU,
        2 / 3 / 2 * TAU,
        new Vec3(0, 0, 1),
      )
    ),
    ...createPresetHexPoints(
      0,
      3 / 3 / 2 * TAU,
      new Vec3().setPolar(TAU / 12, 1),
    ),
  ];
}

function createHexPoints({planeBasis, radius, size, colour}) {
  const result = range(7).map(i => {
    const angle = ((i + 0.5) / 6) * TAU;
    return {
      position: new Vec3(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
        ).inplacePlanePosition3d(planeBasis),
      size,
      colour,
    };
  });
  result.push(null);
  return result;
}

function range(n) {
  const result = [];
  for (let i = 0; i < n; ++i) {
    result.push(i);
  }
  return result;
}

main();