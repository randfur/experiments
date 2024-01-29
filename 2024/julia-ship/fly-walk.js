export class FlyWalk {
  static init() {
    this.zoomSetting = -1000;

    this.wanderer = new Wanderer(Vec4.newDeviate(0.5));

    this.lastDirection = new Vec4();
    this.xDir = Vec4.newDeviate(1);
    this.yDir = Vec4.newDeviate(1);

    this.uniformData = null;

    window.addEventListener('wheel', event => {
      this.zoomSetting += event.deltaY;
    });
    window.addEventListener('click', event => {
      const x = (2 * event.offsetX / window.innerWidth - 1) * Math.max(1, window.innerWidth / window.innerHeight);
      const y = (1 - 2 * event.offsetY / window.innerHeight) * Math.max(1, window.innerHeight / window.innerWidth);
      const newPoint = this.wanderer.currentPoint.add(
        this.xDir.scale(x).add(this.yDir.scale(y)).scale(this.zoom())
      );
      this.wanderer.reset(newPoint, this.lastDirection);
      // this.wanderer.reset(this.wanderer.currentPoint.subtract(this.lastDirection), this.wanderer.currentPoint);
    });
  }

  static zoom() {
    return 2 ** (this.zoomSetting / 400);
  }

  static update(time) {
    if (this.wanderer.toPoint === null) {
      this.wanderer.toPoint = Vec4.newDeviate(0.5);
    }

    const lastPoint = this.wanderer.currentPoint.clone();
    this.wanderer.update();
    const direction = this.wanderer.currentPoint.subtract(lastPoint).normalise();

    if (direction.length() > 0) {
      this.lastDirection = direction;
      this.xDir = this.xDir.makeOrthogonalWith(direction).normalise();
      this.yDir = this.yDir.makeOrthogonalWith(direction).normalise();
      this.yDir = this.yDir.makeOrthogonalWith(this.xDir).normalise();
    }

    this.uniformData = new Float32Array([
      ...this.wanderer.currentPoint.toArray(),
      ...this.xDir.toArray(),
      ...this.yDir.toArray(),
      /*zoom=*/this.zoom(),
    ]);
  }

  static debugRender(context) {
    context.strokeStyle = 'white';
    context.strokeRect(window.innerWidth / 2 - 2, window.innerHeight / 2 - 2, 4, 4);

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
    this.toPoint = null;
    this.currentPoint = this.fromPoint.clone();
  }

  update() {
    console.assert(this.toPoint);

    const progress = this.step / this.maxStep;
    const oldTrajectory = this.fromPoint.lerpTo(
      this.fromPoint.add(this.fromPoint.subtract(this.prevFromPoint)),
      progress,
    );
    const newTrajectory = this.fromPoint.lerpTo(this.toPoint, progress);
    this.currentPoint = oldTrajectory.lerpTo(newTrajectory, smooth(progress));

    ++this.step;
    if (this.step >= this.maxStep) {
      this.prevFromPoint = this.fromPoint;
      this.fromPoint = this.toPoint;
      this.toPoint = null;
      this.step = 0;
    }
  }

  reset(point, direction) {
    this.prevFromPoint = point.subtract(direction.scale(0.1));
    this.fromPoint = point;
    this.currentPoint = point;
    this.toPoint = null;
    this.step = 0;
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
    const length = this.length();
    return length > 0 ? this.scale(1 / length) : this;
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