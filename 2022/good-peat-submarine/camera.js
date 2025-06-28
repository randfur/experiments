import {Vec3} from './utils/vec3.js';
import {rotate} from './utils/math.js';

export class Camera {
  constructor() {
    this.originDistance = 200;
    this.angleY = 0;
    this.zNear = 0.01;
  }
  
  inplaceTransform(position) {
    [position.x, position.z] = rotate(position.x, position.z, Math.cos(this.angleY), Math.sin(this.angleY));
    position.z += this.originDistance;
  }
}