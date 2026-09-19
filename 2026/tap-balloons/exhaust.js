import {Vec3} from '../../third-party/ga/vec3.js';
import {fadeColour, random, deviate} from './utils.js';

export class Exhaust {
  constructor(position, velocityBase, velocityLocal, colour) {
    this.alive = true;
    this.position = position;
    this.velocityBase = velocityBase;
    this.velocityLocal = velocityLocal;
    this.colour = colour;
    this.size = 10;
    this.duration = 600 + random(200);
    this.remaining = this.duration;
  }

  update(time, timeDelta) {
    this.velocityBase.inplaceScale(0.99);
    this.velocityBase.inplaceAdd(Vec3.xyz(deviate(1), deviate(1)).inplaceScale(0.01));
    this.position.inplaceScaleAdd(timeDelta, this.velocityBase);
    this.position.inplaceScaleAdd(timeDelta, this.velocityLocal);

    this.size += timeDelta * 0.1;

    this.remaining -= timeDelta;
    if (this.remaining <= 0) {
      this.alive = false;
    }
  }

  draw(hexLines, textContext) {
    const colour = fadeColour(this.colour, this.remaining / this.duration);
    hexLines.addPointParts(this.position, this.size / 2, colour);
    hexLines.addPointParts(
      Vec3.scaleAdd(this.position, (1 - this.remaining / this.duration) * 200, this.velocityLocal),
      this.size,
      colour,
    );
    hexLines.addNull();
  }
}
