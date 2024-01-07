export class SmoothRandomWalk {
  static init() {
    this.a = new Wanderer({
      maxSteps: 810,
      minSize: 0,
      maxSize: 1,
    });
    this.b = new Wanderer({
      maxSteps: 1670,
      minSize: 0,
      maxSize: 1,
    });
    this.c = new Wanderer({
      maxSteps: 2000,
      minSize: 0.5,
      maxSize: 1.0,
    });
  }

  static update(time) {
    for (const wanderer of [this.a, this.b, this.c]) {
      wanderer.update();
    }

    this.uniformData = new Float32Array([
      ...this.a.currentPoint.toArray(),
      ...this.b.currentPoint.toArray(),
      ...this.c.currentPoint.toArray(),
    ]);
  }
}

class Wanderer {
  constructor({maxSteps, maxSize, minSize}) {
    this.maxSteps = maxSteps;
    this.maxSize = maxSize;
    this.minSize = minSize;

    this.prevFromPoint = this.randomVec4();
    this.fromPoint = this.randomVec4();
    this.toPoint = this.randomVec4();
    this.currentPoint = null;
    this.step = this.maxSteps;
  }

  randomVec4() {
    const size = this.minSize + Math.random() * (this.maxSize - this.minSize);
    const v = new Vec4(
      deviate(1),
      deviate(1),
      deviate(1),
      deviate(1),
    );
    return v.scale(size / v.length());
  }

  update() {
    ++this.step;
    if (this.step >= this.maxSteps) {
      this.prevFromPoint = this.fromPoint;
      this.fromPoint = this.toPoint;
      this.toPoint = this.randomVec4();
      this.step = 0;
    }
    const progress = this.step / this.maxSteps;
    const projectedPoint = this.fromPoint.add(this.fromPoint.subtract(this.prevFromPoint).scale(progress));
    const trajectoryPoint = this.fromPoint.add(this.toPoint.subtract(this.fromPoint).scale(progress));
    this.currentPoint = projectedPoint.lerp(trajectoryPoint, smooth(progress));
  }
}

function deviate(x) {
  return (Math.random() * 2 - 1) * x;
}

function smooth(x) {
  return x <= 0.5 ? x ** 2 * 2 : 1 - (1 - x) ** 2 * 2;
}

class Vec4 {
  constructor(x=0, y=0, z=0, w=0) {
    this.set(x, y, z, w);
  }

  set(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  copy(v) {
    this.set(v.x, v.y, v.z, v.w);
  }

  toArray() {
    return [this.x, this.y, this.z, this.w];
  }

  length() {
    return Math.sqrt(
      this.x ** 2 +
      this.y ** 2 +
      this.z ** 2 +
      this.w ** 2
    );
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

  lerp(v, t) {
    return this.scale(1 - t).add(v.scale(t));
  }
}