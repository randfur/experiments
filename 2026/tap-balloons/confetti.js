import {Vec3} from '../../third-party/ga/vec3.js';
import {random, deviate, range, fadeColour} from './utils.js';

const TAU = Math.PI * 2;

export class Confetti {
  constructor(position, radius, velocityScale, colour, others) {
    this.alive = true;
    const spokes = 4 + random(2);
    const size = radius * (0.2 + random(0.1));
    const phase = random(TAU);
    this.model = range(spokes).map(
      i => new Vec3().setPolar(TAU * i / spokes + phase, random(size)),
    );
    this.model.push(this.model[0]);
    this.colour = colour;

    this.angle = random(TAU);
    this.angleVelocity = random(0.002);

    this.position = new Vec3();
    this.velocity = new Vec3();
    let attemptsLeft = 5;
    while (attemptsLeft > 0) {
      --attemptsLeft;
      this.velocity.setPolar(random(TAU), 1 - random(1) ** 2);
      this.position.setScaleAdd(position, radius / 2, this.velocity);
      let collision = false;
      for (const other of others) {
        if (Vec3.delta(this.position, other.position).squareLength() < (2 * size) ** 2) {
          collision = true;
          break;
        }
      }
      if (!collision) {
        break;
      }
    }
    this.velocity.inplaceScale(velocityScale);

    this.duration = 400 + random(500);
    this.remaining = this.duration;
  }

  update(time, timeDelta) {
    this.angle += this.angleVelocity * timeDelta;
    this.angleVelocity *= 0.9;

    this.position.inplaceScaleAdd(timeDelta, this.velocity);
    this.velocity.inplaceScale(0.9);

    this.remaining -= timeDelta;
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
