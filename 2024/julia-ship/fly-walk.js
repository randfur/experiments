export class FlyWalk {
  static init() {
    this.wanderer = new Wanderer();

    this.xDir = new Vec4(0, 0, 1, 0);
    this.yDir = new Vec4(0, 0, 0, 1);

    this.zoomSetting = 0;

    this.uniformData = null;
  }

  static update(time) {
    // Update position.
    // Get angle change from direction change.
    // Apply angle change to xyDir.
    // Project xyDir orthogonal to current direction.
    // Normalise xyDir.
  }

  static debugRender(context) {
  }
}

class Wanderer {
  constructor() {
    this.step = 0;
    this.maxSteps = 1000;

    this.prevFromPoint = new Vec4();
    this.fromPoint = new Vec4();
    this.toPoint = new Vec4(0, 1, 0, 0);
    this.currentPoint = null;
    this.nextToPoint = null;
    this.nextToPointScore = null;
  }

  clone() {
  }

  update() {
    ++this.step;
  }
}

class Vec4 {
  static newDeviate(x) {
    return new Vec4(
      deviate(x),
      deviate(x),
      deviate(x),
      deviate(x),
    );
  }

  constructor(x=0, y=0, z=0, w=0) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }
}

class Rotor4 {
  static newV1V2(v1, v2) {
    const {x: a, y: b, z: c, w: d} = v1;
    const {x: e, y: f, z: g, w: h} = v2;
    return new Rotor4(
      /*rr=*/a*e + b*f + c*g + d*h,
      /*xy=*/a*f + -b*e,
      /*xz=*/a*g + -c*e,
      /*xw=*/a*h + -d*e,
      /*yz=*/b*g + -c*f,
      /*yw=*/b*h + -d*f,
      /*zw=*/c*h + -d*g,
    );
  }

  constructor(rr, xy, xz, xw, yz, yw, zw) {
    this.rr = rr;
    this.xy = xy;
    this.xz = xz;
    this.xw = xw;
    this.yz = yz;
    this.yw = yw;
    this.zw = zw;
  }
}

function deviate(x) {
  return (Math.random() * 2 - 1) * x;
}