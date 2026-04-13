import {HexLinesContext} from '../../third-party/hex-lines/src/hex-lines.js';
import {Vec3} from '../../third-party/ga/vec3.js';
import {Rotor3} from '../../third-party/ga/rotor3.js';

const TAU = 2 * Math.PI;

async function main() {
  const {hexLinesContext} = HexLinesContext.setupFullPageContext({is3d: true});
  const hexLines = hexLinesContext.createLines();

  const targetSwirly = new Swirly({
    randomTranspose: new Vec3(),
    randomScale: (1 + random(1)) / 100,
    randomSpeed: (1 + random(1)) / 4,
    targetPosition: new Vec3(0, 0, 100),
    targetPull: 0.001,
  });
  const boxes = range(100).map(i => new Box(targetSwirly.position));


  while (true) {
    await new Promise(requestAnimationFrame);

    hexLines.clear();
    targetSwirly.update();
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
  static cubePoints = createCubePoints(20, 2, ([x, y, z]) => ({
    r: ((x + y + z) / 3) ** 0.1 * 255,
    g: ((x + y + z) / 3) ** 0.4 * 255,
    b: (x + y + z) / 3 * 255,
  }));

  constructor(targetPosition) {
    super({
      randomTranspose: new Vec3(deviate(100), deviate(100), deviate(100)),
      randomScale: (1 + random(1)) / 100,
      randomSpeed: (1 + random(1)) / 4,
      targetPosition,
      targetPull: 0.002,
    });

    this.model = new Model(Box.cubePoints);
    this.rotateVelocity = new Rotor3(100 + deviate(1), deviate(1), deviate(1), deviate(1)).inplaceNormalise();

    const starCount = 20;
    this.stars = [];
    let distance = 0;
    for (let i = 0; i < starCount; ++i) {
      let starTargetPosition = this.position;
      if (this.stars.length === 0 || Math.random() < 0.2) {
        distance = 0;
      } else {
        starTargetPosition = this.stars[this.stars.length - 1].position;
        ++distance;
      }
      this.stars.push(new Star(starTargetPosition, distance));
    }
  }

  update() {
    super.update();

    this.model.translate.set(this.position);
    this.model.rotate.inplaceMultiplyRight(this.rotateVelocity).inplaceNormalise();
    this.model.transformPoints();

    for (const star of this.stars) {
      star.update();
    }
  }

  draw(hexLines) {
    hexLines.addPoints(this.model.transformedPoints);

    for (const star of this.stars) {
      star.draw(hexLines);
    }
  }
}

class Star extends Swirly {
  static starPoints = createStarPoints({
    radius: 1,
    strokeSize: 0.5,
    colour: {r: 255, g: 200, b: 100},
  });

  constructor(targetPosition, distance) {
    super({
      randomTranspose: new Vec3(deviate(10), deviate(10), deviate(10)),
      randomScale: 0.1,
      randomSpeed: 0.8,
      targetPosition: targetPosition,
      targetPull: 0.04,
    });
    this.model = new Model(Star.starPoints);
    this.model.scale = 1 / (1 + distance);
    this.rotateVelocity = new Rotor3(20 + deviate(1), deviate(1), deviate(1), deviate(1)).inplaceNormalise();
  }

  update() {
    super.update();

    this.model.translate.set(this.position);
    this.model.rotate.inplaceMultiplyRight(this.rotateVelocity).inplaceNormalise();
    this.model.transformPoints();
  }

  draw(hexLines) {
    hexLines.addPoints(this.model.transformedPoints);
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

function createStarPoints({radius, strokeSize, colour}) {
  return range(7).map(i => {
    if (i > 5) {
      return null;
    }
    const angle = 2 * i / 5 * TAU;
    return {
      position: new Vec3().setPolar(angle, radius),
      size: strokeSize,
      colour,
    };
  });
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