import {HexLinesContext} from '../../third-party/hex-lines/src/hex-lines.js';
import {Vec3} from '../../third-party/ga/vec3.js';
import {Rotor3} from '../../third-party/ga/rotor3.js';

let boxes = [];

async function main() {
  const {hexLinesContext} = HexLinesContext.setupFullPageContext({is3d: true});
  const hexLines = hexLinesContext.createLines();

  boxes = range(100).map(i => new Box());

  while (true) {
    await new Promise(requestAnimationFrame);

    hexLines.clear();
    for (const box of boxes) {
      box.update();
      box.draw(hexLines);
    }
    hexLines.draw();
  }
}

class Swirly {
  constructor({randomTranspose, randomScale, randomSpeed, targetPosition, targetPull}) {
    this.position = targetPosition.clone();
    this.randomScale = randomScale;
    this.randomSpeed = randomSpeed;
    this.randomTranspose = randomTranspose;
    this.targetPosition = targetPosition;
    this.targetPull = targetPull;
  }

  update() {
    this.position.inplaceAdd(
      Vec3.a.set(this.position)
        .inplaceScale(this.randomScale)
        .inplaceYzx()
        .inplaceAdd(this.randomTranspose)
        .inplaceMap(Math.sin)
        .inplaceScale(this.randomSpeed)
        .inplaceScaleAdd(this.targetPull, Vec3.b.setDelta(this.position, this.targetPosition))
    );
  }
}

class Box extends Swirly {
  constructor() {
    super({
      randomTranspose: new Vec3(deviate(100), deviate(100), deviate(100)),
      randomScale: (1 + random(1)) / 100,
      randomSpeed: (1 + random(1)) / 4,
      targetPosition: new Vec3(0, 0, 200),
      targetPull: 0.001,
    });

    this.model = new Model(createCubePoints(20, 2, ([x, y, z]) => ({
      r: ((x + y + z) / 3) ** 0.1 * 255,
      g: ((x + y + z) / 3) ** 0.4 * 255,
      b: (x + y + z) / 3 * 255,
    })));

    this.model.rotate.setComponents(deviate(1), deviate(1), deviate(1), deviate(1)).inplaceNormalise();
    this.rotateVelocity = new Rotor3(100 + deviate(1), deviate(1), deviate(1), deviate(1)).inplaceNormalise();

    const bugCount = 10;
    this.bugs = [];
    let distance = 0;
    for (let i = 0; i < bugCount; ++i) {
      let targetPosition = this.position;
      if (this.bugs.length === 0 || Math.random() < 0.2) {
        distance = 0;
      } else {
        targetPosition = this.bugs[this.bugs.length - 1].position;
        ++distance;
      }
      this.bugs.push(new Bug(targetPosition, distance));
    }
  }

  update() {
    super.update();

    this.model.translate.set(this.position);
    this.model.rotate.inplaceMultiplyRight(this.rotateVelocity).inplaceNormalise();
    this.model.transformPoints();

    for (const bug of this.bugs) {
      bug.update();
    }
  }

  draw(hexLines) {
    hexLines.addPoints(this.model.transformedPoints);

    for (const bug of this.bugs) {
      bug.draw(hexLines);
    }
  }
}

class Bug extends Swirly {
  constructor(targetPosition, distance) {
    super({
      randomTranspose: new Vec3(deviate(10), deviate(10), deviate(10)),
      randomScale: 0.1,
      randomSpeed: 0.5,
      targetPosition: targetPosition,
      targetPull: 0.01,
    });
    this.distance = distance;
  }

  draw(hexLines) {
    hexLines.addDot({
      position: this.position,
      size: 3 / (this.distance + 1),
      colour: {r: 255, g: 200, b: 100},
    });
  }
}

class Model {
  constructor(originalPoints) {
    this.originalPoints = originalPoints;
    this.transformedPoints = originalPoints.map(
      point => point
        ? {
          position: point.position.clone(),
          size: point.size,
          colour: structuredClone(point.colour),
        }
        : null
    );

    this.translate = new Vec3();
    this.scale = 1;
    this.rotate = new Rotor3();
  }

  transformPoints() {
    for (let i = 0; i < this.transformedPoints.length; ++i) {
      const originalPoint = this.originalPoints[i];
      if (originalPoint !== null) {
        this.transformedPoints[i].position
          .set(originalPoint.position)
          .inplaceScale(this.scale)
          .inplaceRotateRotor3(this.rotate)
          .inplaceAdd(this.translate);
      }
    }
  }
}

function createCubePoints(sideLength, strokeSize, colourFunction) {
  return [
    [0, 0, 0],
    [1, 0, 0],
    [1, 1, 0],
    [0, 1, 0],
    [0, 0, 0],
    [0, 0, 1],
    [0, 1, 1],
    [0, 1, 0],
    null,
    [1, 0, 0],
    [1, 0, 1],
    [0, 0, 1],
    null,
    [1, 1, 0],
    [1, 1, 1],
    [0, 1, 1],
    null,
    [1, 1, 1],
    [1, 0, 1],
    null,
  ].map(corner =>
    corner
    ? {
      position: new Vec3(corner[0], corner[1], corner[2])
        .inplaceMap(x => x - 0.5)
        .inplaceScale(sideLength),
      size: strokeSize,
      colour: colourFunction(corner),
    }
    : null
  );
}

function range(n) {
  const result = [];
  for (let i = 0; i < n; ++i) {
    result.push(i);
  }
  return result;
}

function random(x) {
  return Math.random() * x;
}

function deviate(x) {
  return Math.random() * x * 2 - x;
}

main();