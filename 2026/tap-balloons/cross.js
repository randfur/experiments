import {Vec3} from '../../third-party/ga/vec3.js';
import {drawModel} from './utils.js';

export class Cross {
  constructor(position) {
    this.alive = true;
    this.position = position;
    this.remaining = 10;
  }

  update(time, timeDelta) {
    --this.remaining;
    this.alive = this.remaining > 0;
  }

  draw(hexLines, textContext) {
    const bump = (Math.floor(this.remaining / 3) % 2 == 0 ? 1 : -1) * 1;
    drawModel(hexLines, crossModelPoints, 3, grey, point => {
      return Vec3
        .scale(20, point)
        .inplaceRotateXyAngle(0.1)
        .inplaceAdd(this.position)
        .inplaceAddXyz(-1 + bump, -1 - bump);
    });
  }
}

const grey = {r: 100, g: 100, b: 100};

const crossModelPoints = [
  new Vec3(-0.70, 0.78),
  new Vec3(0.78, -0.71),
  new Vec3(-0.67, 0.85),
  new Vec3(0.66, -0.64),
  null,
  new Vec3(0.83, 0.68),
  new Vec3(-0.82, -0.71),
  new Vec3(0.66, 0.63),
  new Vec3(-0.67, -0.67),
  new Vec3(0.53, 0.48),
  null,
];