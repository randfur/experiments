import {Pool} from './pool.js';

export class Vec3 {
  static pool = new Pool(() => new Vec3());

  constructor(x=0, y=0, z=0) {
    this.setXyz(x, y, z);
  }

  set(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
  }

  setXyz(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  setPolar(angle, radius, z) {
    this.x = Math.cos(angle) * radius;
    this.y = Math.sin(angle) * radius;
    this.z = z;
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
  }

  addXyz(x, y, z) {
    this.x += x;
    this.y += y;
    this.z += z;
  }

  subtract(v) {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
  }

  assignSubtract(a, b) {
    this.x = a.x - b.x;
    this.y = a.y - b.y;
    this.z = a.z - b.z;
  }

  assignAdd(a, b) {
    this.x = a.x + b.x;
    this.y = a.y + b.y;
    this.z = a.z + b.z;
  }
}