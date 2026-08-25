import {Vec3} from '../../third-party/ga/vec3.js';
import {Rotor3} from '../../third-party/ga/rotor3.js';

export class Point {
  constructor() {
    this.distance = 0;
    this.position = new Vec3();
    this.orientation = new Rotor3();
  }

  set(other) {
    this.distance = other.distance;
    this.position.set(other.position);
    this.orientation.set(other.orientation);
    return this;
  }

  setLerp(a, b, t) {
    this.distance = lerp(a.distance, b.distance, t);
    this.position.setLerp(a.position, b.position, t);
    this.orientation.setLerp(a.orientation, b.orientation, t).inplaceNormalise();
    return this;
  }
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}
