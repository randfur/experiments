import {Vec3} from '../../third-party/ga/vec3.js';
import {fadeColour, random, deviate} from './utils.js';

export class Exhaust {
  constructor(position, velocityBase, velocityLocal, colour) {
    this.alive = true;
    this.position = position;
    this.velocityBase = velocityBase;
    this.velocityLocal = velocityLocal;
    this.colour = colour;
    this.size = 1;
    this.length = 30 + random(20);
    this.duration = 400 + random(400);
    this.remaining = this.duration;
  }

  update(time, timeDelta) {
    this.velocityBase.inplaceScale(0.9);
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
    hexLines.addPointParts(this.position, this.size / 1.2, colour);
    hexLines.addPointParts(
      Vec3
        .scaleAdd(this.position, (1 - this.remaining / this.duration) * this.length, this.velocityLocal)
        .inplaceScaleAdd(this.length, this.velocityBase),
      this.size,
      colour,
    );
    hexLines.addNull();
  }
}
