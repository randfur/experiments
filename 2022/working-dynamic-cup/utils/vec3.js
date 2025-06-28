import {Pool} from './pool.js';
import {lerp} from './math.js';

export class Vec3 {
  static pool = new Pool(() => new Vec3());
  
  constructor(x=0, y=0, z=0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  
  getIndex(i) {
    switch (i) {
      case 0: return this.x;
      case 1: return this.y;
      case 2: return this.z;
    }
  }

  setIndex(i, x) {
    switch (i) {
      case 0: this.x = x; return;
      case 1: this.y = x; return;
      case 2: this.z = x; return;
    }
  }

  set(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  
  copy(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
  }
  
  add(v) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
  }
  
  subtract(v) {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
  }
  
  addXyz(x, y, z) {
    this.x += x;
    this.y += y;
    this.z += z;
  }
  
  scale(k) {
    this.x *= k;
    this.y *= k;
    this.z *= k;
  }
  
  squareDistanceTo(v) {
    const result = (this.x - v.x) ** 2 + (this.y - v.y) ** 2 + (this.z - v.z) ** 2;
    return result;
  }
  
  lerpBetween(a, b, t) {
    this.x = lerp(a.x, b.x, t);
    this.y = lerp(a.y, b.y, t);
    this.z = lerp(a.z, b.z, t);
  }
}