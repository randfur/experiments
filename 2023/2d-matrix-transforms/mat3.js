// Represents the following matrix shape:
// [a c e]
// [b d f]
// [0 0 1]
// This matches the parameters of HTMLCanvasContext2D.setTransform().
export class Mat3 {
  constructor({a=1, b=0, c=0, d=1, e=0, f=0}={}) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.e = e;
    this.f = f;
  }

  reset() {
    this.a = 1;
    this.b = 0;
    this.c = 0;
    this.d = 1;
    this.e = 0;
    this.f = 0;
  }

  copy(otherMat3) {
    this.a = otherMat3.a;
    this.b = otherMat3.b;
    this.c = otherMat3.c;
    this.d = otherMat3.d;
    this.e = otherMat3.e;
    this.f = otherMat3.f;
  }

  applyTransformJson(transformJson) {
    // interface TransformJson {
    //   origin: Vec2Json;
    //   scale: Vec2Json;
    //   rotate: Vec2Json;
    //   translate: Vec2Json;
    // }

    // The matrix is multiplied on the left of a column vector, we know this because otherwise e and f would pollute the final row.
    // We can either multiply on the right with a row vector or on the left with a column vector.
    // Example:
    // On right with row vector:
    //   https://www.wolframalpha.com/input?i=%7B%7B100%2C+100%2C+1%7D%7D+*+%7B%7B1%2C+1%2C+50%7D%2C+%7B-0.5%2C+1%2C+0%7D%2C+%7B0%2C+0%2C+1%7D%7D
    //   The third value becomes non-1 which is bad.
    // On left with column vector:
    //   https://www.wolframalpha.com/input?i=%7B%7B1%2C+1%2C+50%7D%2C+%7B-0.5%2C+1%2C+0%7D%2C+%7B0%2C+0%2C+1%7D%7D+*+%7B%7B100%7D%2C+%7B100%7D%2C+%7B1%7D%7D
    //   The third value stays as 1.
    // The translation values are on the right of the matrix, this probably forces the co-ordinate vector to be a column vector.
    // If we were to use a row vector then the translation values would probably have to be on the bottom of the matrix.

    // These configurations work, idk why but they do so trust them. We manually tested them.
    // The nice order of thinking is:
    // Apply outer transforms like camera first, then instance transform then part transform.
    // For each transform apply origin, scale, rotate then translate.
    // In reality everything is flipped, idk why.
    const multiplyLeft = false;
    const reverseOrder = true;

    const multiplyWith = (otherMat3) => {
      const [left, right] = multiplyLeft ? [otherMat3, this] : [this, otherMat3];
      const {a: la, b: lb, c: lc, d: ld, e: le, f: lf} = left;
      const {a: ra, b: rb, c: rc, d: rd, e: re, f: rf} = right;
      // [la lc le] * [ra rc re]
      // [lb ld lf] * [rb rd rf]
      // [ 0  0  1] * [ 0  0  1]
      this.a = la * ra + lc * rb;
      this.b = lb * ra + ld * rb;
      this.c = la * rc + lc * rd;
      this.d = lb * rc + ld * rd;
      this.e = la * re + lc * rf + le;
      this.f = lb * re + ld * rf + lf;
    }

    const {origin, scale, rotate, translate} = transformJson;

    // Position reference:
    // [a c e]
    // [b d f]
    // [0 0 1]
    const mat3sToMultiply = [
      // origin
      new Mat3({
        e: -(origin?.x ?? 0),
        f: -(origin?.y ?? 0),
      }),

      // scale
      new Mat3({
        a: scale?.x ?? 1,
        d: scale?.y ?? 1,
      }),

      // rotate
      // Rotate (x, y) by (rx, ry)
      // (x + iy) * (rx + iry)
      // x*rx - y*ry + i(y*rx + x*ry)
      //
      // Because e and f are on the right side of the matrix we must be multiplying by column vectors.
      // Otherwise, with a row vector, we would end up with the bottom right being non-one after multiplication.
      // [a c e]   [x]   [ax + cy + e]
      // [b d f] * [y] = [bx + dy + f]
      // [0 0 1]   [1]   [1]
      new Mat3({
        a: rotate?.x ?? 1,
        c: rotate?.y ?? 0,
        b: -(rotate?.y ?? 0),
        d: rotate?.x ?? 1,
      }),

      // translate
      new Mat3({
        e: translate?.x ?? 0,
        f: translate?.y ?? 0,
      }),
    ];

    if (reverseOrder) {
      mat3sToMultiply.reverse();
    }

    for (const mat3 of mat3sToMultiply) {
      multiplyWith(mat3);
    }
  }

  applyToContext(context) {
    context.setTransform(this.a, this.b, this.c, this.d, this.e, this.f);
  }
}
