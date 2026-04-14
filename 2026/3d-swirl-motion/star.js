import {Swirly} from './swirly.js';
import {Vec3} from '../../third-party/ga/vec3.js';
import {Rotor3} from '../../third-party/ga/rotor3.js';
import {Model} from './model.js';
import {TAU, random, range, deviate} from './utils.js';

export class Star extends Swirly {
  static starPoints = createStarPoints({
    radius: 2,
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
    this.model.colourOverride = {
      r: 255,
      g: 200,
      b: 100 + Math.max(0, random(50 - distance * 10)),
    };
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

