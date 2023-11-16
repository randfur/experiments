export class Vec3 {
  // TODO:
  // - rotateRotor
  // - rotateAxisAngle
  // - rotateAToB

  static pool = {
    buffer: [],
    used: 0,
    get() {
      if (this.buffer.length === this.used) {
        this.buffer.push(new Vec3());
      }
      return this.buffer[++this.used];
    },
    clear() {
      this.used = 0;
    },
  };

  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  clone() {
    return new Vec3(this.x, this.y, this.z);
  }

  squareLength() {
    return this.x ** 2 + this.y ** 2 + this.z ** 2;
  }

  length() {
    return this.squareLength() ** 0.5;
  }

  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  setXyz(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  set(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }

  setAdd(va, vb) {
    this.x = va.x + vb.x;
    this.y = va.y + vb.y;
    this.z = va.z + vb.z;
    return this;
  }

  setSum(ka, va, kb, vb) {
    this.x = ka * va.x + kb * vb.x;
    this.y = ka * va.y + kb * vb.y;
    this.z = ka * va.z + kb * vb.z;
    return this;
  }

  setDelta(va, vb) {
    this.x = vb.x - va.x;
    this.y = vb.y - va.y;
    this.z = vb.z - va.z;
    return this;
  }

  setNormalise(v) {
    const length = v.length();
    this.x = v.x / length;
    this.y = v.y / length;
    this.z = v.z / length;
    return this;
  }
}
