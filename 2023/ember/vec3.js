import {Rotor3} from './rotor3.js';

export class Vec3 {
  // TODO:
  // - rotateRotor
  // - rotateAxisAngle
  // - rotateAToB

  static tempBuffer = [];
  static tempsUsed = 0;

  static getTemp(x=0, y=0, z=0) {
    if (this.tempBuffer.length === this.tempsUsed) {
      this.tempBuffer.push(new Vec3());
    }
    return this.tempBuffer[this.tempsUsed++].setXyz(x, y, z);
  }

  static clearTemps() {
    this.tempsUsed = 0;
  }

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

  set(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }

  setXyz(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  setScale(k, v) {
    this.x = k * v.x;
    this.y = k * v.y;
    this.z = k * v.z;
    return this;
  }

  setAdd(va, vb) {
    this.x = va.x + vb.x;
    this.y = va.y + vb.y;
    this.z = va.z + vb.z;
    return this;
  }

  setScaleAdd(va, kb, vb) {
    this.x = va.x + kb * vb.x;
    this.y = va.y + kb * vb.y;
    this.z = va.z + kb * vb.z;
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
    if (length === 0) {
      this.setXyz(0, 0, 0);
      return this;
    }
    this.x = v.x / length;
    this.y = v.y / length;
    this.z = v.z / length;
    return this;
  }

  setRotateRotor(v, r) {
    const rotated =
      Rotor3.getTemp(r.rr, -r.yz, -r.zx, -r.xy)
        .inplaceMultiply(Rotor3.getTemp(0, v.x, v.y, v.z))
        .inplaceMultiply(r);
    this.x = rotated.yz;
    this.y = rotated.zx;
    this.z = rotated.xy;
    return this;
  }

  inplaceScale(k) { return this.setScale(k, this); }
  inplaceAdd(v) { return this.setAdd(this, v); }
  inplaceScaleAdd(k, v) { return this.setScaleAdd(this, k, v); }
  inplaceSum(ka, kb, vb) { return this.setSum(ka, this, kb, vb); }
  inplaceDelta(v) { return this.setDelta(this, v); }
  inplaceNormalise() { return this.setNormalise(this); }
  inplaceRotateRotor(r) { return this.setRotateRotor(this, r); }
}
