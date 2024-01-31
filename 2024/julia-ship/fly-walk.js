export class FlyWalk {
  static init() {
    this.zoomSetting = -2500;

    this.wanderer = new Wanderer(pickRandom([
      new Vec4(.14, .65, -.22, -.73),
      new Vec4(-.01, .18, -.03, -.76),
      new Vec4(-.53, -.97, .31, .03),
      new Vec4(-.32, -.52, -.75, -.13),
      new Vec4(-.11, -.07, -1.76, -.01),
      new Vec4(.10, -.04, -1.76, .01),
      new Vec4(-1.3, .11, -.75, -.1),
      new Vec4(-.82, -.35, -.8, -.16),
      new Vec4(1.14, 0.14, -.75, -.24),
    ]));

    this.toPointScore = [];
    this.nextToPoint = null;
    this.nextToPointScore = [-Infinity];

    this.lastDirection = new Vec4();
    this.xDir = Vec4.newDeviate(1).normalise();
    this.yDir = Vec4.newDeviate(1).normalise();
    this.yDir = this.yDir.makeOrthogonalWith(this.xDir).normalise();

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
      this.wanderer.reset(newPoint, this.lastDirection.scale(this.zoom() / 10));
      this.toPointScore = [];
      this.nextToPoint = null;
      this.nextToPointScore = [-Infinity];
    });
  }

  static zoom() {
    return 2 ** (this.zoomSetting / 400);
  }

  static update(time) {
    const runs = this.nextToPoint === null && this.wanderer.toPoint === null ? 50 : 1;
    for (let run = 0; run < runs; ++run) {
      const {nextToPoint, score} = generateNextToPoint(
        this.wanderer.fromPoint,
        this.wanderer.toPoint,
        Math.min(this.zoom() * 3, 0.5),
      );
      if (sum(score) > sum(this.nextToPointScore)) {
        this.nextToPoint = nextToPoint;
        this.nextToPointScore = score;
      }
    }

    if (this.wanderer.toPoint === null) {
      this.wanderer.toPoint = this.nextToPoint;
      this.toPointScore = this.nextToPointScore;
      this.nextToPoint = null;
      this.nextToPointScore = [-Infinity];
    }

    const lastPoint = this.wanderer.currentPoint.clone();
    this.wanderer.update();
    const direction = this.wanderer.currentPoint.subtract(lastPoint).normalise();

    if (direction.length() > 0) {
      if (this.lastDirection.length() > 0) {
        const rotor = Rotor4.newFromTo(this.lastDirection, direction);
        this.xDir = rotor.rotate(this.xDir).normalise();
        this.yDir = rotor.rotate(this.yDir).normalise();
      }

      this.xDir = this.xDir.makeOrthogonalWith(direction).normalise();
      this.yDir = this.yDir.makeOrthogonalWith(direction).normalise();
      this.yDir = this.yDir.makeOrthogonalWith(this.xDir).normalise();
      this.lastDirection = direction;
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
    function printText(text) {
      context.fillText(text, 20, y);
      y += 16;
    }
    function printVec4(text, v) {
      printText(`${text}: ${v ? v.toArray().map(x => x.toFixed(2)).join(', ') : null}`);
    }
    printText(`step: ${this.wanderer.step}`);
    printVec4('prevFromPoint', this.wanderer.prevFromPoint);
    printVec4('fromPoint', this.wanderer.fromPoint);
    printVec4('currentPoint', this.wanderer.currentPoint);
    printVec4('toPoint', this.wanderer.toPoint);
    printText(`toPointScore: ${this.toPointScore}`);
    printVec4('nextToPoint', this.nextToPoint);
    printText(`nextToPointScore: ${this.nextToPointScore}`);
    printText(`nextToPoint distance: ${
      this.wanderer.toPoint && this.nextToPoint
      ? this.wanderer.toPoint.subtract(this.nextToPoint).length()
      : null
    }`);
    printVec4('xDir', this.xDir);
    printVec4('yDir', this.yDir);
    printText(`zoomSetting: ${this.zoomSetting}`);
    printText(`zoom: ${this.zoom()}`);
  }
}

function smoothTriLerp(prevFromPoint, fromPoint, toPoint, progress) {
  const oldTrajectory = prevFromPoint.lerpTo(fromPoint, 1 + progress);
  const newTrajectory = fromPoint.lerpTo(toPoint, progress);
  return oldTrajectory.lerpTo(newTrajectory, smooth(progress));
}

function generateNextToPoint(fromPoint, toPoint, distance) {
  if (!toPoint) {
    toPoint = fromPoint;
  }
  const nextToPoint = toPoint.add(Vec4.newDeviate(distance));

  const iterationCount = 100;
  const probeCount = 20;
  const probes = [];
  for (let probe = 0; probe < probeCount; ++probe) {
    const point = smoothTriLerp(fromPoint, toPoint, nextToPoint, probe / probeCount);
    let {x: zr, y: zi, z: cr, w: ci} = point;
    for (let i = 0; i < iterationCount; ++i) {
      [zr, zi] = [zr * zr - zi * zi + cr, 2 * zr * zi + ci];
    }
    probes.push(zr * zr + zi * zi < 2 * 2);
  }

  const score = [];
  // Favour changes.
  const changeFraction = sum(probes.map((x, i) => i > 0 ? x !== probes[i - 1] : false)) / probeCount;
  score.push((changeFraction * 10) ** 2);
  const pointDeltaDirection = nextToPoint.subtract(toPoint).normalise();
  // Favour turning.
  score.push(-10 * Math.abs(pointDeltaDirection.dot(toPoint.subtract(fromPoint).normalise())));
  // Go towards/away from origin if lost.
  if (changeFraction === 0) {
    score.push(100 * pointDeltaDirection.dot(fromPoint.scale(probes[0] ? 1 : -1).normalise()));
  }

  return {
    nextToPoint,
    score,
  };
}

function sum(list) {
  return list.reduce((acc, x) => acc + x, 0);
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

class Wanderer {
  constructor(startPoint) {
    this.step = 0;
    this.maxStep = 1000;

    this.prevFromPoint = startPoint;
    this.fromPoint = startPoint;
    this.toPoint = null;
    this.currentPoint = this.fromPoint.clone();
  }

  update() {
    console.assert(this.toPoint);

    const progress = this.step / this.maxStep;
    this.currentPoint = smoothTriLerp(this.prevFromPoint, this.fromPoint, this.toPoint, progress);

    ++this.step;
    if (this.step >= this.maxStep) {
      this.prevFromPoint = this.fromPoint;
      this.fromPoint = this.toPoint;
      this.toPoint = null;
      this.step = 0;
    }
  }

  reset(point, direction) {
    this.prevFromPoint = point.subtract(direction);
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

class Rotor4 {
  static newFromTo(from, to) {
    from = from.normalise();
    to = to.normalise();
    const {x: a, y: b, z: c, w: d} = from;
    const {x: e, y: f, z: g, w: h} = to.add(from).normalise();
    // https://randfur.github.io/experiments/2024/ga-expander/#v1%20%3D%20a*B0%20%2B%20b*B1%20%2B%20c*B2%20%2B%20d*B3%3B%0Av2%20%3D%20e*B0%20%2B%20f*B1%20%2B%20g*B2%20%2B%20h*B3%3B%0A%0Av1%20*%20v2
    // v1 = a*B0 + b*B1 + c*B2 + d*B3;
    // v2 = e*B0 + f*B1 + g*B2 + h*B3;
    // v1 * v2
    // = (a*e + b*f + c*g + d*h)
    // + (a*f + -b*e)*B0*B1
    // + (a*g + -c*e)*B0*B2
    // + (a*h + -d*e)*B0*B3
    // + (b*g + -c*f)*B1*B2
    // + (b*h + -d*f)*B1*B3
    // + (c*h + -d*g)*B2*B3
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

  rotate(v) {
    // https://randfur.github.io/experiments/2024/ga-expander/#rotor%20%3D%20rr%20%2B%20xy*B0*B1%20%2B%20xz*B0*B2%20%2B%20xw*B0*B3%20%2B%20yz*B1*B2%20%2B%20yw*B1*B3%20%2B%20zw*B2*B3%3B%0Aposition%20%3D%20x*B0%20%2B%20y*B1%20%2B%20z*B2%20%2B%20w*B3%3B%0A%0Aconjugate(rotor)%20*%20position%20*%20rotor
    // rotor = rr + xy*B0*B1 + xz*B0*B2 + xw*B0*B3 + yz*B1*B2 + yw*B1*B3 + zw*B2*B3;
    // position = x*B0 + y*B1 + z*B2 + w*B3;
    // conjugate(rotor) * position * rotor
    // = (rr*rr*x + -2*rr*xy*y + -2*rr*xz*z + -2*rr*w*xw + -x*xy*xy + 2*xy*yz*z + 2*w*xy*yw + -x*xz*xz + -2*xz*y*yz + 2*w*xz*zw + -x*xw*xw + -2*xw*y*yw + -2*xw*z*zw + x*yz*yz + x*yw*yw + x*zw*zw)*B0
    // + (2*rr*x*xy + rr*rr*y + -2*rr*yz*z + -2*rr*w*yw + -xy*xy*y + -2*xy*xz*z + -2*w*xw*xy + -2*x*xz*yz + xz*xz*y + -2*x*xw*yw + xw*xw*y + -y*yz*yz + 2*w*yz*zw + -y*yw*yw + -2*yw*z*zw + y*zw*zw)*B1
    // + (2*rr*x*xz + 2*rr*y*yz + rr*rr*z + -2*rr*w*zw + 2*x*xy*yz + -2*xy*xz*y + xy*xy*z + -xz*xz*z + -2*w*xw*xz + -2*x*xw*zw + xw*xw*z + -yz*yz*z + -2*w*yw*yz + -2*y*yw*zw + yw*yw*z + -z*zw*zw)*B2
    // + (2*rr*x*xw + 2*rr*y*yw + 2*rr*z*zw + rr*rr*w + 2*x*xy*yw + -2*xw*xy*y + w*xy*xy + 2*x*xz*zw + -2*xw*xz*z + w*xz*xz + -w*xw*xw + 2*y*yz*zw + -2*yw*yz*z + w*yz*yz + -w*yw*yw + -w*zw*zw)*B3
    const {x, y, z, w} = v;
    const {rr, xy, xz, xw, yz, yw, zw} = this;
    return new Vec4(
      /*x=*/rr*rr*x + -2*rr*xy*y + -2*rr*xz*z + -2*rr*w*xw + -x*xy*xy + 2*xy*yz*z + 2*w*xy*yw + -x*xz*xz + -2*xz*y*yz + 2*w*xz*zw + -x*xw*xw + -2*xw*y*yw + -2*xw*z*zw + x*yz*yz + x*yw*yw + x*zw*zw,
      /*y=*/2*rr*x*xy + rr*rr*y + -2*rr*yz*z + -2*rr*w*yw + -xy*xy*y + -2*xy*xz*z + -2*w*xw*xy + -2*x*xz*yz + xz*xz*y + -2*x*xw*yw + xw*xw*y + -y*yz*yz + 2*w*yz*zw + -y*yw*yw + -2*yw*z*zw + y*zw*zw,
      /*z=*/2*rr*x*xz + 2*rr*y*yz + rr*rr*z + -2*rr*w*zw + 2*x*xy*yz + -2*xy*xz*y + xy*xy*z + -xz*xz*z + -2*w*xw*xz + -2*x*xw*zw + xw*xw*z + -yz*yz*z + -2*w*yw*yz + -2*y*yw*zw + yw*yw*z + -z*zw*zw,
      /*w=*/2*rr*x*xw + 2*rr*y*yw + 2*rr*z*zw + rr*rr*w + 2*x*xy*yw + -2*xw*xy*y + w*xy*xy + 2*x*xz*zw + -2*xw*xz*z + w*xz*xz + -w*xw*xw + 2*y*yz*zw + -2*yw*yz*z + w*yz*yz + -w*yw*yw + -w*zw*zw,
    );
  }
}

function deviate(x) {
  return (Math.random() * 2 - 1) * x;
}

function smooth(x) {
  return 120 * (x ** 5 / 20 - x ** 4 / 8 + x ** 3 / 12);
}