export class FlyWalk {
  static init() {
    this.zoomSetting = -1000;

    this.wanderer = new Wanderer(new Vec4(.35, .56, -.21, -.7));

    this.xDir = Vec4.newDeviate(1);
    this.yDir = Vec4.newDeviate(1);

    this.uniformData = null;
  }

  static zoom() {
    return 2 ** (this.zoomSetting / 400);
  }

  static update(time) {
    const lastPoint = this.wanderer.currentPoint.clone();
    this.wanderer.update();
    const direction = this.wanderer.currentPoint.subtract(lastPoint).normalise();
    // const direction = this.wanderer.currentPoint.add(new Vec4(1, 0, 0, 0));

    this.xDir = this.xDir.makeOrthogonalWith(direction).normalise();
    this.yDir = this.yDir.makeOrthogonalWith(direction).normalise();
    this.yDir = this.yDir.makeOrthogonalWith(this.xDir).normalise();

    this.uniformData = new Float32Array([
      ...this.wanderer.currentPoint.toArray(),
      ...this.xDir.toArray(),
      ...this.yDir.toArray(),
      /*zoom=*/this.zoom(),
    ]);
  }

  static debugRender(context) {
    context.fillStyle = 'white';
    let y = 32;
    function printVec4(v) {
      context.fillText(v.toArray().map(x => x.toFixed(1)).join(', '), 20, y);
      y += 16;
    }
    printVec4(this.wanderer.currentPoint);
    printVec4(this.xDir);
    printVec4(this.yDir);
  }
}

class Wanderer {
  constructor(startPoint) {
    this.step = 0;
    this.maxStep = 1000;

    this.prevFromPoint = new Vec4();
    this.fromPoint = startPoint;
    this.toPoint = this.fromPoint.add(Vec4.newDeviate(0.001));
    this.currentPoint = this.fromPoint.clone();
    this.nextToPoint = null;
    this.nextToPointScore = null;
  }

  update() {
    ++this.step;
    if (this.step >= this.maxStep) {
      this.prevFromPoint = this.fromPoint;
      this.fromPoint = this.toPoint;
      this.toPoint = this.nextToPoint;
      if (this.toPoint === null) {
        this.toPoint = Vec4.newDeviate(0.5);
      }
      this.nextToPoint = null;
      this.step = 0;
    }

    const progress = this.step / this.maxStep;
    const oldTrajectory = this.fromPoint.lerpTo(
      this.fromPoint.add(this.fromPoint.subtract(this.prevFromPoint)),
      progress,
    );
    const newTrajectory = this.fromPoint.lerpTo(this.toPoint, progress);
    this.currentPoint = oldTrajectory.lerpTo(newTrajectory, smooth(progress));
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

  clone() {
    return new Vec4(
      this.x,
      this.y,
      this.z,
      this.w,
    );
  }

  toArray() {
    return [
      this.x,
      this.y,
      this.z,
      this.w,
    ];
  }

  add(v) {
    return new Vec4(
      this.x + v.x,
      this.y + v.y,
      this.z + v.z,
      this.w + v.w,
    );
  }

  subtract(v) {
    return new Vec4(
      this.x - v.x,
      this.y - v.y,
      this.z - v.z,
      this.w - v.w,
    );
  }

  scale(k) {
    return new Vec4(
      this.x * k,
      this.y * k,
      this.z * k,
      this.w * k,
    );
  }

  length(k) {
    return Math.sqrt(this.dot(this));
  }

  dot(v) {
    return (
      this.x * v.x +
      this.y * v.y +
      this.z * v.z +
      this.w * v.w
    );
  }

  normalise() {
    return this.scale(1 / this.length());
  }

  lerpTo(v, t) {
    return this.scale(1 - t).add(v.scale(t));
  }

  makeOrthogonalWith(direction) {
    return this.subtract(
      direction.scale(
        this.dot(direction)
      )
    );
  }
}

// class Rotor4 {
//   static newV1V2(v1, v2) {
//     const {x: a, y: b, z: c, w: d} = v1;
//     const {x: e, y: f, z: g, w: h} = v2;
//     return new Rotor4(
//       /*rr=*/a*e + b*f + c*g + d*h,
//       /*xy=*/a*f + -b*e,
//       /*xz=*/a*g + -c*e,
//       /*xw=*/a*h + -d*e,
//       /*yz=*/b*g + -c*f,
//       /*yw=*/b*h + -d*f,
//       /*zw=*/c*h + -d*g,
//     );
//   }

//   constructor(rr, xy, xz, xw, yz, yw, zw) {
//     this.rr = rr;
//     this.xy = xy;
//     this.xz = xz;
//     this.xw = xw;
//     this.yz = yz;
//     this.yw = yw;
//     this.zw = zw;
//   }
// }

function deviate(x) {
  return (Math.random() * 2 - 1) * x;
}

function smooth(x) {
  return x < 0.5 ? 2 * x ** 2 : 1 - 2 * (x - 1) ** 2;
}