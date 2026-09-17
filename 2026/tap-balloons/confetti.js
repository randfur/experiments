import {Vec3} from '../../third-party/ga/vec3.js';
import {random, deviate, range, fadeColour} from './utils.js';

const TAU = Math.PI * 2;

export class Confetti {
  constructor(position, radius, colour) {
    this.alive = true;
    this.position = position;
    const spokes = 4;
    const size = 20;
    const phase = random(TAU);
    this.model = range(spokes).map(
      i => new Vec3().setPolar(TAU * i / spokes + phase, random(size)),
    );
    this.model.push(this.model[0]);
    this.colour = colour;

    this.angle = random(TAU);
    this.angleVelocity = random(0.2);

    this.velocity = new Vec3().setPolar(random(TAU), 1 - random(1) ** 2);
    this.position.inplaceScaleAdd(radius, this.velocity);
    this.velocity.inplaceScale(10);

    this.duration = 20 + random(20);
    this.remaining = this.duration;
  }

  update(time, timeDelta) {
    this.angle += this.angleVelocity;
    this.angleVelocity *= 0.9;

    this.position.inplaceAdd(this.velocity);
    this.velocity.inplaceScale(0.9);

    --this.remaining;
    this.alive = this.remaining > 0;
  }

  draw(hexLines, textContext) {
    const fadedColour = fadeColour(this.colour, this.remaining / this.duration);
    for (const point of this.model) {
      hexLines.addPointParts(
        Vec3.set(point).inplaceRotateXyAngle(this.angle).inplaceAdd(this.position),
        4,
        fadedColour,
      );
    }
    hexLines.addNull();
  }
}
