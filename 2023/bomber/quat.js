import {Vec3} from './vec3.js'
import {Pool} from './pool.js'

export class Quat {
  static pool = new Pool(() => new Quat());

  constructor() {
    this.setIdentity();
  }

  set(other) {
    this.a = other.a;
    this.b = other.b;
    this.c = other.c;
    this.d = other.d;
  }

  setAbcd(a, b, c, d) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
  }

  setIdentity() {
    this.a = 1;
    this.b = 0;
    this.c = 0;
    this.d = 0;
  }

  setRotation(x, y, z, angle) {
    const sin = Math.sin(angle / 2);
    this.a = Math.cos(angle / 2);
    this.b = x * sin;
    this.c = y * sin;
    this.d = z * sin;
  }

  rotate(x, y, z, angle) {
    const rotation = Quat.pool.acquire();
    rotation.setRotation(x, y, z, angle);
    this.multiplyLeft(rotation);
    Quat.pool.release(1);
  }

  relativeRotate(x, y, z, angle) {
    const axis = Vec3.pool.acquire();
    axis.setXyz(x, y, z);
    axis.rotateQuat(this);
    this.rotate(axis.x, axis.y, axis.z, angle);
  }

  multiplyLeft(other) {
    // (a + ib + jc + kd) * (e + if + jg + kh)
    //
    // ae + iaf + jag + kah +
    // ibe + iibf + ijbg + ikbh +
    // jce + jicf + jjcg + jkch +
    // kde + kidf + kjdg + kkdh
    //
    // ae + iaf + jag + kah +
    // ibe - bf + kbg - jbh +
    // jce - kcf - cg + ich +
    // kde + jdf - idg - dh
    //
    // (ae - bf - cg - dh) +
    // i(af + be + ch - dg) +
    // j(ag - bh + ce + df) +
    // k(ah + bg - cf + de)
    const {a, b, c, d} = other;
    const {a: e, b: f, c: g, d: h} = this;
    this.a = a * e - b * f - c * g - d * h;
    this.b = a * f + b * e + c * h - d * g;
    this.c = a * g - b * h + c * e + d * f;
    this.d = a * h + b * g - c * f + d * e;
  }

  normalise() {
    const length = Math.sqrt(this.a ** 2 + this.b ** 2 + this.c ** 2 + this.d ** 2);
    this.a /= length;
    this.b /= length;
    this.c /= length;
    this.d /= length;
  }
}
