import {Pool} from './pool.js';
import {Quat} from './quat.js';

export class Vec3 {
  static pool = new Pool(() => new Vec3());

  static copyList(vs) {
    return vs.map(v => new Vec3(v.x, v.y, v.z));
  }

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

  setZPolar(angle, radius, z) {
    this.x = Math.cos(angle) * radius;
    this.y = Math.sin(angle) * radius;
    this.z = z;
  }

  setYPolar(angle, radius, y) {
    this.x = Math.cos(angle) * radius;
    this.y = y;
    this.z = Math.sin(angle) * radius;
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

  assignScale(v, k) {
    this.x = v.x * k;
    this.y = v.y * k;
    this.z = v.z * k;
  }

  rotateXAngle(angle) {
    this.rotateX(Math.cos(angle), Math.sin(angle));
  }

  rotateX(ry, rz) {
    // (y + i.z) * (ry + i.rz)
    // y.ry - z.rz + i(y.rz + z.ry)
    [this.y, this.z] = [
      this.y * ry - this.z * rz,
      this.y * rz + this.z * ry,
    ];
  }

  rotateYAngle(angle) {
    this.rotateY(Math.cos(angle), Math.sin(angle));
  }

  rotateY(rx, rz) {
    // (x + i.z) * (rx + i.rz)
    // x.rx - z.rz + i(x.rz + z.rx)
    [this.x, this.z] = [
      this.x * rx - this.z * rz,
      this.x * rz + this.z * rx,
    ];
  }

  rotateQuat(q) {
    const result = Quat.pool.acquire();
    result.setAbcd(q.a, -q.b, -q.c, -q.d);
    const vectorQuat = Quat.pool.acquire();
    vectorQuat.setAbcd(0, this.x, this.y, this.z);
    result.multiplyLeft(vectorQuat);
    result.multiplyLeft(q);
    this.x = result.b;
    this.y = result.c;
    this.z = result.d;
    Quat.pool.release(2);
  }

  length() {
    return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
  }
}
