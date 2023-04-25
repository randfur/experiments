import {Vec3} from './vec3.js';

export class Camera {
  constructor() {
    this.position = new Vec3();
    // this.orientation = new Quat();
    this.rotateYAngle = 0;
    this.perspective = 800;
    this.minZ = 1;
  }

  transformLine(line) {
    this.transformPoint(line.start);
    this.transformPoint(line.end);

    if (line.start.z < this.minZ && line.end.z < this.minZ) {
      return false;
    }

    const midZ = (line.start.z + line.end.z) / 2;
    line.width *= this.perspective / midZ;

    if (line.start.z < this.minZ) {
      this.clip(line.start, line.end);
    } else if (line.end.z < this.minZ) {
      this.clip(line.end, line.start);
    }

    line.start.x *= this.perspective / line.start.z;
    line.start.y *= this.perspective / line.start.z;
    line.end.x *= this.perspective / line.end.z;
    line.end.y *= this.perspective / line.end.z;
    return true;
  }

  transformPoint(point) {
    point.subtract(this.position);
    point.rotateYAngle(this.rotateYAngle);
  }

  clip(near, far) {
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
