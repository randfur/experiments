import {Vec3} from '../../third-party/ga/vec3.js';
import {TAU, easeIn} from './utils.js';

export class Shockwave {
  constructor(position, colour, radius, thickness) {
    this.alive = true;
    this.position = position;
    this.colour = colour;
    this.radius = radius;
    this.thickness = thickness;
    this.remaining = duration;
    this.progress = 0;
  }

  update(time, timeDelta) {
    this.remaining -= timeDelta;
    this.progress = easeIn(1 - this.remaining / duration);

    if (this.remaining <= 0) {
      this.alive = false;
    }
  }

  draw(hexLines) {
    const spokes = 20;

    for (let i = 0; i <= spokes; ++i) {
      hexLines.addPointParts(
        Vec3
          .polar(TAU * i / spokes, (0.5 + 1.5 * this.progress) * this.radius)
          .inplaceAdd(this.position),
        this.thickness,
        this.colour,
      );
    }
    hexLines.addNull();

    for (let i = 0; i <= spokes; ++i) {
      hexLines.addPointParts(
        Vec3
          .polar(TAU * i / spokes, (0.8 + 1.5 * this.progress) * this.radius)
          .inplaceAdd(this.position),
        this.thickness / 3,
        this.colour,
      );
    }
    hexLines.addNull();
  }
}

const duration = 200;
