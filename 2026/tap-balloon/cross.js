import {Vec3} from '../../third-party/ga/vec3.js';
import {drawModel} from './utils.js';

export class Cross {
  constructor(position) {
    this.alive = true;
    this.position = position;
    this.remaining = 300;
  }

  update(time, timeDelta) {
    this.remaining -= timeDelta;
    if (this.remaining <= 0) {
      this.alive = false;
    }
  }

  draw(hexLines) {
    const bump = (Math.floor(this.remaining / 40) % 2 == 0 ? 1 : -1) * 2;
    drawModel(hexLines, crossModel, 10, brown, point => {
      return Vec3
        .scale(100, point)
        .inplaceRotateXyAngle(0.05)
        .inplaceAdd(this.position)
        .inplaceAddXyz(-3 + bump, 1 - bump);
    });
  }
}

const brown = {r: 100, g: 10, b: 20};

const crossModel = [
  new Vec3(-0.74, 0.70),
  new Vec3(0.74, -0.71),
  new Vec3(-0.71, 0.85),
  new Vec3(0.56, -0.70),
  null,
  new Vec3(0.80, 0.68),
  new Vec3(-0.85, -0.71),
  new Vec3(0.63, 0.63),
  new Vec3(-0.70, -0.67),
  new Vec3(0.50, 0.48),
  null,
];
