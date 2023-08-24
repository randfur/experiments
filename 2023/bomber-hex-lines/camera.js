import {Vec3} from './vec3.js';
import {TAU} from './utils.js';

export class Camera {
  static position;
  static rotateYAngle;
  static perspective;
  static minZ;

  static init() {
    this.position = new Vec3();
    this.rotateYAngle = 0;
    this.rotateXAngle = TAU * 0.005;
    this.perspective = 800;
    this.minZ = 1;
  }

  static update(timeDelta, time) {
    const angle = TAU * 0.85 - time / 10000;
    this.position.setYPolar(angle, 500, -300);
    this.rotateYAngle = -angle - TAU * 0.25;
  }

  static transformLine(line) {
    this.transformPoint(line.start);
    this.transformPoint(line.end);

    if (line.start.z < this.minZ && line.end.z < this.minZ) {
      return false;
    }

    if (line.start.z < this.minZ) {
      this.clip(line.start, line.end);
    } else if (line.end.z < this.minZ) {
      this.clip(line.end, line.start);
    }

    line.midZ = (line.start.z + line.end.z) / 2;
    line.width *= this.perspective / line.midZ;

    line.start.x *= this.perspective / line.start.z;
    line.start.y *= this.perspective / line.start.z;
    line.end.x *= this.perspective / line.end.z;
    line.end.y *= this.perspective / line.end.z;
    return true;
  }

  static transformPoint(point) {
    point.subtract(this.position);
    point.rotateYAngle(this.rotateYAngle);
    point.rotateXAngle(this.rotateXAngle);
  }

  static clip(near, far) {
    const delta = Vec3.pool.acquire();
    delta.assignSubtract(near, far);
    const desiredZ = this.minZ - far.z;
    delta.x *= desiredZ / delta.z;
    delta.y *= desiredZ / delta.z;
    delta.z = desiredZ;
    near.assignAdd(far, delta);
    Vec3.pool.release(1);
  }
}
