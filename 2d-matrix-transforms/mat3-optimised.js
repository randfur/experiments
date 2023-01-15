// Represents the following matrix shape:
// [a c e]
// [b d f]
// [0 0 1]
// This matches the order of HTMLCanvasContext2D.setTransform()'s parameters.
export class Mat3 {
  constructor() {
    this.a = 1;
    this.b = 0;
    this.c = 0;
    this.d = 1;
    this.e = 0;
    this.f = 0;
  }

  reset() {
    this.a = 1;
    this.b = 0;
    this.c = 0;
    this.d = 1;
    this.e = 0;
    this.f = 0;
  }

  applyTransformJson(transformJson) {
    // interface TransformJson {
    //   origin: Vec2Json;
    //   scale: Vec2Json;
    //   rotate: Vec2Json;
    //   translate: Vec2Json;
    // }
    // interface Vec2Json {
    //   x: number;
    //   y: number;
    // }

    // translate
    // [a c e]   [1 0 tx]
    // [b d f] * [0 1 ty]
    // [0 0 1]   [0 0  1]
    const tx = transformJson.translate?.x ?? 0;
    const ty = transformJson.translate?.y ?? 0;
    [
      this.e,
      this.f,
    ] = [
      this.a * tx + this.c * ty + this.e,
      this.b * tx + this.d * ty + this.f,
    ];

    // rotate
    // [a c e]   [rx -ry  0]
    // [b d f] * [ry  rx  0]
    // [0 0 1]   [ 0   0  1]
    const rx = transformJson.rotate?.x ?? 1;
    const ry = transformJson.rotate?.y ?? 0;
    [
      this.a,
      this.b,
      this.c,
      this.d,
    ] = [
      this.a * rx + this.c * ry,
      this.b * rx + this.d * ry,
      this.a * -ry + this.c * rx,
      this.b * -ry + this.d * rx,
    ];

    // scale
    // [a c e]   [sx  0  0]
    // [b d f] * [ 0 sy  0]
    // [0 0 1]   [ 0  0  1]
    const sx = transformJson.scale?.x ?? 1;
    const sy = transformJson.scale?.y ?? 1;
    [
      this.a,
      this.b,
      this.c,
      this.d,
    ] = [
      this.a * sx,
      this.b * sx,
      this.c * sy,
      this.d * sy,
    ];

    // origin
    // [a c e]   [1 0 -ox]
    // [b d f] * [0 1 -oy]
    // [0 0 1]   [0 0   1]
    const ox = transformJson.origin?.x ?? 0;
    const oy = transformJson.origin?.y ?? 0;
    [
      this.e,
      this.f,
    ] = [
      this.a * -ox + this.c * -oy + this.e,
      this.b * -ox + this.d * -oy + this.f,
    ];
  }

  applyToContext(context) {
    context.setTransform(this.a, this.b, this.c, this.d, this.e, this.f);
  }
}
