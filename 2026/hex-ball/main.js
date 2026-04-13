import {HexLinesContext} from '../../third-party/hex-lines/src/hex-lines.js';
import {PlaneBasis} from '../../third-party/ga/plane-basis.js';
import {Vec3} from '../../third-party/ga/vec3.js';
import {Rotor3} from '../../third-party/ga/rotor3.js';
import {Mat4} from '../../third-party/ga/mat4.js';

const TAU = Math.PI * 2;

async function main() {
  const {hexLinesContext} = HexLinesContext.setupFullPageContext({
    is3d: true,
    pixelSize: 3,
  });
  const hexLines = hexLinesContext.createLines();

  const colourStops = [
    {r: 255, g: 255, b: 255},
    {r: 127, g: 0, b: 255},
    {r: 0, g: 0, b: 127},
    {r: 0, g: 0, b: 0},
  ];
  const hexBallCount = 200;
  const hexBalls = range(hexBallCount).map(i => {
    const t = i / (hexBallCount - 1);
    const colour = interpolateColours(colourStops, t);
    return new HexBall(colour, t);
  });

  while (true) {
    const time = await new Promise(requestAnimationFrame);
    hexLines.clear();

    for (const hexBall of hexBalls) {
      hexBall.update(time);
      hexBall.render(hexLines);
    }

    new Mat4()
      .inplaceMultiplyLeft(
        new Mat4().setRotateXy(TAU / 4 - time / 10000)
      )
      .inplaceMultiplyLeft(
        new Mat4().setTranslateXyz(0, 2000, -1000)
      )
      .inplaceMultiplyLeft(
        new Mat4().setRotateYz(0.7 * TAU / 4)
      )
      .inplaceMultiplyLeft(
        new Mat4().setTranslateXyz(0, 0, 6000)
      )
      .exportToArrayBuffer(hexLines.transformMatrix);

    hexLines.draw();
  }
}

class HexBall {
  constructor(colour, t) {
    this.model = new Model(createHexBallPoints({
      ballRadius: 350,
      hexRadius: 150,
      size: 30,
      colour,
    }));
    this.timer = 0;
    this.destination = new Vec3();
    this.direction = new Vec3().setPolar(Math.random() * TAU);
    this.t = t;
  }

  update(time) {
    if (this.timer <= 0) {
      this.timer = Math.random() * 100 + 100;
      const arenaSize = 6000;
      this.destination.setXyz(
        deviate(arenaSize * 1.25),
        -arenaSize + this.t * 2 * arenaSize + deviate(arenaSize / 4),
      );
    }
    --this.timer;
    this.direction.inplaceTurnTowards(this.model.translation, this.destination, Math.cos(TAU / 100));
    this.model.translation.inplaceScaleAdd(20, this.direction);
    this.model.orientation.inplaceMultiplyRight(
      Rotor3.vec3ToVec3(
        Vec3.b.set(this.direction).inplaceScale(0.05).inplaceAddXyz(0, 0, 1),
        Vec3.c.setZ(),
      )
    );
  }

  render(hexLines) {
    this.model.render(hexLines);
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
        Mat4.rotateRotor3(this.orientation)
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

function deviate(x) {
  return Math.random() * 2 * x - x;
}

function clampAbs(x, abs) {
  return x > abs ? abs : x < -abs ? -abs : x;
}

function interpolateColours(colourStops, t) {
  const steps = colourStops.length - 1;
  const index = Math.min(Math.floor(t * steps), steps - 1);
  const start = colourStops[index];
  const end = colourStops[index + 1];
  const subT = t * steps - index;
  return {
    r: interpolate(start.r, end.r, subT),
    g: interpolate(start.g, end.g, subT),
    b: interpolate(start.b, end.b, subT),
  }
}

function interpolate(a, b, t) {
  return a + t * (b - a);
}

main();
