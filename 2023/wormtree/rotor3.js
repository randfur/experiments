export class Rotor3 {
  static tempBuffer = [];
  static tempsUsed = 0;

  static getTemp(rr=1, yz=0, zx=0, xy=0) {
    if (this.tempBuffer.length === this.tempsUsed) {
      this.tempBuffer.push(new Rotor3());
    }
    return this.tempBuffer[this.tempsUsed++].setComponents(rr, yz, zx, xy);
  }

  static clearTemps() {
    this.tempsUsed = 0;
  }

  constructor(rr=1, yz=0, zx=0, xy=0) {
    this.rr = rr;
    this.yz = yz;
    this.zx = zx;
    this.xy = xy;
  }

  squareLength() {
    return this.rr ** 2 + this.yz ** 2 + this.zx ** 2 + this.xy ** 2;
  }

  length() {
    return Math.sqrt(this.squareLength());
  }

  clone() {
    return new Rotor3().set(this);
  }

  setIdentity() {
    this.rr = 1;
    this.yz = 0;
    this.zx = 0;
    this.xy = 0;
    return this;
  }

  setComponents(rr, yz, zx, xy) {
    this.rr = rr;
    this.yz = yz;
    this.zx = zx;
    this.xy = xy;
    return this;
  }

  set(r) {
    this.rr = r.rr;
    this.yz = r.yz;
    this.zx = r.zx;
    this.xy = r.xy;
    return this;
  }

  setAxisAngle(axis, angle) {
    const sin = Math.sin(angle / 2);
    this.rr = Math.cos(angle / 2);
    this.yz = axis.x * sin;
    this.zx = axis.y * sin;
    this.xy = axis.z * sin;
    return this;
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
    this.rr = ad + be + cf;
    this.yz = bf - ce;
    this.zx = -af + cd;
    this.xy = ae - bd;
    return this;
  }

  setConjugate(r) {
    this.rr = r.rr;
    this.yz = -r.yz;
    this.zx = -r.zx;
    this.xy = -r.xy;
    return this;
  }

  setNormalise(r) {
    const length = r.length();
    this.rr = r.rr / length;
    this.yz = r.yz / length;
    this.zx = r.zx / length;
    this.xy = r.xy / length;
    return this;
  }

  setMultiply(ra, rb) {
    const {rr: a, yz: b, zx: c, xy: d} = ra;
    const {rr: e, yz: f, zx: g, xy: h} = rb;
    // (arr + byz + czx + dxy) * (err + fyz + gzx + hxy)
    // = aerrrr + beyzrr + cezxrr + dexyrr +
    //   afrryz + bfyzyz + cfzxyz + dfxyyz +
    //   agrrzx + bgyzzx + cgzxzx + dgxyzx +
    //   ahrrxy + bhyzxy + chzxxy + dhxyxy
    // = aerr + beyz + cezx + dexy +
    //   afyz + -bfrr + cfxy + -dfzx +
    //   agzx + -bgxy + -cgrr + dgyz +
    //   ahxy + bhzx + -chyz + -dhrr
    // = (ae + -bf + -cg + -dh)rr
    //   (be + af + dg + -ch)yz +
    //   (ce + -df + ag + bh)zx +
    //   (de + cf + -bg + ah)xy
    this.rr = a * e - b * f - c * g - d * h;
    this.yz = b * e + a * f + d * g - c * h;
    this.zx = c * e - d * f + a * g + b * h;
    this.xy = d * e + c * f - b * g + a * h;
    return this;
  }

  inplaceConjugate() { return this.setConjugate(this); }
  inplaceNormalise() { return this.setNormalise(this); }
  inplaceMultiply(r) { return this.setMultiply(this, r); }
}
