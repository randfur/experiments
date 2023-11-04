import {Engine} from './engine.js';

export class Worm {
  constructor() {
    this.position = new Vec3(0, 0, 100);
    this.velocity = new Vec3(1, 0, 1);
  }

  async run() {
    for await (const i of frameRange(100)) {
      this.velocity.y += 0.01;
    }
    for await (const i of frameRange(100)) {
      this.velocity.y -= 0.02;
    }
  }

  step() {
    this.position.inplaceAdd(this.velocity);
  }

  draw(hexLines) {
    hexLines.addPointTwice({
      position: this.position,
      size: 10,
      colour: {r: 255, g: 0, b: 0},
    });
    hexLines.addNull();
  }
}

class Vec3 {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  inplaceAdd(v) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
  }

  length() {
    return (this.x ** 2 + this.y ** 2 + this.z ** 2) ** 0.5;
  }
}

class Rotor3 {
  constructor(r=1, yz=0, zx=0, xy=0) {
    this.r = r;
    this.yz = yz;
    this.zx = zx;
    this.xy = xy;
  }

  setAxisAngle(axis, angle) {
    const sin = Math.sin(angle / 2);
    this.r = Math.cos(angle / 2);
    this.yz = axis.x * sin;
    this.zx = axis.y * sin;
    this.xy = axis.z * sin;
  }

  setVecToVec(va, vb) {
    const {x: a, y: b, z: c} = va;
    const {x: d, y: e, z: f} = vb;
    d += a;
    e += b;
    f += c;
    const lengthA = va.length();
    const lengthB = (d ** 2 + e ** 2 + f ** 2) ** 0.5;
    a /= lengthA;
    b /= lengthA;
    c /= lengthA;
    d /= lengthB;
    e /= lengthB;
    f /= lengthB;
    // (ax + by + cz) * (dx + ey + fz)
    // = adxx + aexy + afxz +
    //   bdyx + beyy + bfyz +
    //   cdzx + cezy + cfzz
    // = ad + aexy + -afzx +
    //   -bdxy + be + bfyz +
    //   cdzx + -ceyz + cf
    // = (ad + be + cf) +
    //   (bf - ce)yz +
    //   (-af + cd)zx +
    //   (ae - bd)xy
    this.r = ad + be + cf;
    this.yz = bf - ce;
    this.zx = -af + cd;
    this.xy = ae - bd;
  }
}

async function* frameRange(n) {
  for (let i = 0; i < n; ++i) {
    yield i;
    await Engine.nextFrame;
  }
}

function* range(n) {
  for (let i = 0; i < n; ++i) {
    yield i;
  }
}
