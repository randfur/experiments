import {Vec3} from '../../third-party/ga/vec3.js';
import {fadeColour, random, deviate} from './utils.js';

export class Shrapnel {
  constructor(position, velocity, orientationVelocity) { 
    this.alive = true;
    this.position = position;
    this.velocity = velocity;
    this.orientation = new Rotor3();
    this.orientationVelocity = orientationVelocity;
    this.duration = 1000 + random(500);
    this.remaining = this.duration;
  }

  update(time, timeDelta) {

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
