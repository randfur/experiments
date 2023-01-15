// Represents the following matrix shape:
// [[0] [2] [4]]
// [[1] [3] [5]]
// [ 0   0   1 ]
// This matches the order of HTMLCanvasContext2D.setTransform()'s parameters.
export class Mat3 {
  constructor() {
    this.data = new Float64Array(6);
    this.reset();
  }

  reset() {
    this.data[0] = 1;
    this.data[1] = 0;
    this.data[2] = 0;
    this.data[3] = 1;
    this.data[4] = 0;
    this.data[5] = 0;
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
    // [[0] [2] [4]]   [1 0 tx]
    // [[1] [3] [5]] * [0 1 ty]
    // [ 0   0   1 ]   [0 0  1]
    const tx = transformJson.translate?.x ?? 0;
    const ty = transformJson.translate?.y ?? 0;
    [
      this.data[4],
      this.data[5],
    ] = [
      this.data[0] * tx + this.data[2] * ty + this.data[4],
      this.data[1] * tx + this.data[3] * ty + this.data[5],
    ];

    // rotate
    // [[0] [2] [4]]   [rx -ry  0]
    // [[1] [3] [5]] * [ry  rx  0]
    // [ 0   0   1 ]   [ 0   0  1]
    const rx = transformJson.rotate?.x ?? 1;
    const ry = transformJson.rotate?.y ?? 0;
    [
      this.data[0],
      this.data[1],
      this.data[2],
      this.data[3],
    ] = [
      this.data[0] * rx + this.data[2] * ry,
      this.data[1] * rx + this.data[3] * ry,
      this.data[0] * -ry + this.data[2] * rx,
      this.data[1] * -ry + this.data[3] * rx,
    ];

    // scale
    // [[0] [2] [4]]   [sx  0  0]
    // [[1] [3] [5]] * [ 0 sy  0]
    // [ 0   0   1 ]   [ 0  0  1]
    const sx = transformJson.scale?.x ?? 1;
    const sy = transformJson.scale?.y ?? 1;
    [
      this.data[0],
      this.data[1],
      this.data[2],
      this.data[3],
    ] = [
      this.data[0] * sx,
      this.data[1] * sx,
      this.data[2] * sy,
      this.data[3] * sy,
    ];

    // origin
    // [[0] [2] [4]]   [1 0 -ox]
    // [[1] [3] [5]] * [0 1 -oy]
    // [ 0   0   1 ]   [0 0   1]
    const ox = transformJson.origin?.x ?? 0;
    const oy = transformJson.origin?.y ?? 0;
    [
      this.data[4],
      this.data[5],
    ] = [
      this.data[0] * -ox + this.data[2] * -oy + this.data[4],
      this.data[1] * -ox + this.data[3] * -oy + this.data[5],
    ];
  }

  applyToContext(context) {
    context.setTransform(this.data[0], this.data[1], this.data[2], this.data[3], this.data[4], this.data[5]);
  }
}
