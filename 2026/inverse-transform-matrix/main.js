const TAU = Math.PI * 2;

// a b c
// d e f
// g h i
class Mat3 {
  constructor() {
    this.setIdentity();
  }

  setParts(a, b, c, d, e, f, g, h, i) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.e = e;
    this.f = f;
    this.g = g;
    this.h = h;
    this.i = i;
    return this;
  }

  setIdentity() {
    return this.setParts(
      1, 0, 0,
      0, 1, 0,
      0, 0, 1,
    );
  }

  setRotate(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return this.setParts(
      cos, -sin, 0,
      sin, cos, 0,
      0, 0, 1,
    );
  }

  setScale(scale) {
    return this.setParts(
      scale, 0, 0,
      0, scale, 0,
      0, 0, 1,
    );
  }

  setTranslate(x, y) {
    return this.setParts(
      1, 0, x,
      0, 1, y,
      0, 0, 1,
    );
  }

  setMultiply(x, y) {
    // [ a b c ]   [ j k l ]
    // [ d e f ] * [ n m o ]
    // [ g h i ]   [ p q r ]

    const {a, b, c, d, e, f, g, h, i} = x;
    const {a: j, b: k, c: l, d: m, e: n, f: o, g: p, h: q, i: r} = y;

    return this.setParts(
      a * j + b * n + c * p,
      a * k + b * m + c * q,
      a * l + b * o + c * r,

      d * j + e * n + f * p,
      d * k + e * m + f * q,
      d * l + e * o + f * r,

      g * j + h * n + i * p,
      g * k + h * m + i * q,
      g * l + h * o + i * r,
    );
  }

  toString() {
    return (
`${this.a.toFixed(2)} ${this.b.toFixed(2)} ${this.c.toFixed(2)}
${this.d.toFixed(2)} ${this.e.toFixed(2)} ${this.f.toFixed(2)}
${this.g.toFixed(2)} ${this.h.toFixed(2)} ${this.i.toFixed(2)}`);
  }

  setInverse(transform) {
    const {a, b, c, d, e, f, g, h, i} = transform;
    return this.setMultiply(
      new Mat3().setScale(1),
      new Mat3().setMultiply(
        new Mat3().setParts(
          a, d, 0,
          b, e, 0,
          0, 0, 1,
        ),
        new Mat3().setTranslate(-c, -f),
      ),
    );
  }
}

class Vec2 {
  constructor(x=0, y=0) {
    this.x = x;
    this.y = y;
  }

  setTransform(mat3, vec2) {
    this.x = mat3.a * vec2.x + mat3.b * vec2.y + mat3.c;
    this.y = mat3.d * vec2.x + mat3.e * vec2.y + mat3.f;
    return this;
  }
}

function main() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const context = canvas.getContext('2d');
  document.body.append(canvas);

  const point = new Vec2(200, 100);
  const transform = new Mat3().setMultiply(
    new Mat3().setTranslate(100, 50),
    new Mat3().setMultiply(
      new Mat3().setRotate(TAU * 0.1),
      new Mat3().setMultiply(
        new Mat3().setTranslate(200, 200),
        new Mat3().setMultiply(
          new Mat3().setScale(1),
          new Mat3().setRotate(TAU * 0.6),
        ),
      ),
    ),
  );
  const transformedPoint = new Vec2().setTransform(transform, point);
  const inverseTransform = new Mat3().setInverse(transform);
  const untransformedPoint = new Vec2().setTransform(inverseTransform, transformedPoint);

  console.log(point);
  console.log(transform.toString());
  console.log(transformedPoint);
  console.log(inverseTransform.toString());
  console.log(untransformedPoint);

  context.fillStyle = 'black';
  context.fillRect(point.x, point.y, 10, 10);
  context.fillStyle = 'blue';
  context.fillRect(transformedPoint.x, transformedPoint.y, 10, 10);
  context.fillStyle = 'lime';
  context.fillRect(untransformedPoint.x, untransformedPoint.y, 10, 10);
}

main();