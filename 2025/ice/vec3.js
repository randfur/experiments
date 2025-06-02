import {deviate} from './utils.js';

export class Vec3 {
  constructor(x=0, y=0, z=0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  deviate(x, y=null, z=null) {
    this.x += deviate(x);
    this.y += deviate(y ?? x);
    this.z += deviate(z ?? y ?? x);
    return this;
  }

  add(other) {
    this.x += other.x;
    this.y += other.y;
    this.z += other.z;
    return this;
  }

  addScaled(other, k) {
    this.x += other.x * k;
    this.y += other.y * k;
    this.z += other.z * k;
    return this;
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  rotateXTo(other) {
    const otherLength = other.length();
    let a = other.x / otherLength + 1;
    let b = other.y / otherLength;
    let c = other.z / otherLength;
    const tempLength = Math.sqrt(a * a + b * b + c * c);
    a /= tempLength;
    b /= tempLength;
    c /= tempLength;

    const {x: d, y: e, z: f} = this;

    // rotor = x * (ax + by + cz)
    // = a + bxy + cxz
    // result = conj(rotor) * this * rotor
    // = (a - bxy - cxz) * (dx + ey + fz) * (a + bxy + cxz)
    // = (adx + aey + afz - bdxyx - bexyy - bfxyz - cdxzx - cexzy - cfxzz) * (a + bxy + cxz)
    // = (adx + aey + afz + bdy - bex - bfxyz + cdz + cexyz - cfx) * (a + bxy + cxz)
    // = (
    //     aadx + aaey + aafz + abdy - abex - abfxyz + acdz + acexyz - acfx +
    //     abdxxy + abeyxy + abfzxy + bbdyxy - bbexxy - bbfxyzxy + bcdzxy + bcexyzxy - bcfxxy +
    //     acdxxz + aceyxz + acfzxz + bcdyxz - bcexxz - bcfxyzxz + ccdzxz + ccexyzxz - ccfxxz
    //   )
    // = (
    //     aadx + aaey + aafz + abdy - abex - abfxyz + acdz + acexyz - acfx +
    //     abdy - abex + abfxyz - bbdx - bbey + bbfz + bcdxyz - bcez - bcfy +
    //     acdz - acexyz - acfx - bcdxyz - bcez - bcfy - ccdx + ccey - ccfz
    //   )
    // = (
    //     (aad - abe - acf - abe - bbd - acf - ccd)x +
    //     (aae + abd + abd - bbe - bcf - bcf + cce)y +
    //     (aaf + acd + bbf - bce + acd - bce + cce)z +
    //     (-abf + ace + abf + bcd - ace - bcd)xyz
    //   )
    // = (
    //     (aad - 2abe - 2acf - bbd - ccd)x +
    //     (aae + 2abd - bbe - 2bcf + cce)y +
    //     (aaf + 2acd + bbf - 2bce + cce)z
    //   )

    this.x = a * a * d - 2 * a * b * e - 2 * a * c * f - b * b * d - c * c * d;
    this.y = a * a * e + 2 * a * b * d - b * b * e - 2 * b * c * f + c * c * e;
    this.z = a * a * f + 2 * a * c * d + b * b * f - 2 * b * c * e + c * c * e;
    return this;
  }
}
