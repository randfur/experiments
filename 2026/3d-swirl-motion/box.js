import {Swirly} from './swirly.js';
import {Star} from './star.js';
import {Vec3} from '../../third-party/ga/vec3.js';
import {Rotor3} from '../../third-party/ga/rotor3.js';
import {Model} from './model.js';
import {random, range, deviate} from './utils.js';

export class Box extends Swirly {
  static cubePoints = createCubePoints(20, 2, ([x, y, z]) => ({
    r: ((x + y + z) / 3) ** 0.1 * 255,
    g: ((x + y + z) / 3) ** 0.4 * 255,
    b: (x + y + z) / 3 * 255,
  }));

  constructor(targetPosition, mouse) {
    super({
      randomTranspose: new Vec3(deviate(100), deviate(100), deviate(100)),
      randomScale: (1 + random(1)) / 100,
      randomSpeed: (1 + random(1)) / 4,
      targetPosition,
      targetPull: 0,
    });

    this.originalRandomSpeed = this.randomSpeed;
    this.originalRandomScale = this.randomScale;

    this.mouse = mouse;

    this.model = new Model(Box.cubePoints);
    this.model.scale = 1 - random(0.5);
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
    if (this.mouse.down) {
      this.targetPull = 0.08;
      this.randomSpeed = 5.5;
      this.randomScale = 0.02;
    } else {
      this.targetPull += (0.002 - this.targetPull) * 0.01;
      this.randomSpeed += (this.originalRandomSpeed - this.randomSpeed) * 0.01;
      this.randomScale += (this.originalRandomScale - this.randomScale) * 0.01;
    }
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
