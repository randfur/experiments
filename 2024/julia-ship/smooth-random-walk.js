const debugUnitRadius = 200;
const TAU = Math.PI * 2;

export class SmoothRandomWalk {
  static init() {
    this.zoomSetting = -2000;

    this.xDirGuide = new Wanderer({
      maxSteps: 810,
      minSize: 0,
      maxSize: 1,
      debugColour: 'lime',
    });

    this.yDirGuide = new Wanderer({
      maxSteps: 1670,
      minSize: 0,
      maxSize: 1,
      debugColour: 'blue',
    });

    this.centre = new Wanderer({
      maxSteps: 1000,
      minSize: 0.5,
      maxSize: 1.5,
      debugColour: '#c00',
    });
    // this.centre.fromPoint.set(-0.8, -0.1, -0.9, 0.24);
    this.centre.fromPoint.set(1.05, 0.62, -0.25, -0.64);
    this.centre.prevFromPoint.copy(this.centre.fromPoint.add(this.randomVec4()));
    this.centre.toPoint.copy(this.centre.fromPoint.add(this.randomVec4()));
    for (let i = 0; i < 10; ++i) {
      this.updateCentreNextToPoint();
    }
    this.centre.steps = this.centre.maxSteps;
    window.addEventListener('click', event => {
      this.clickX = ((event.offsetX / innerWidth - 0.5) * 2) * Math.max(1, innerWidth / innerHeight);
      this.clickY = ((0.5 - event.offsetY / innerHeight) * 2) * Math.max(1, innerHeight / innerWidth);
      const xDir = this.xDirGuide.currentPoint.normalise();
      const yDir = this.yDirGuide.currentPoint.subtract(xDir.scale(xDir.dot(this.yDirGuide.currentPoint))).normalise();
      const clickPosition = this.centre.currentPoint.add(
        xDir.scale(this.clickX).add(yDir.scale(this.clickY)).scale(this.getZoom())
      );
      this.centre.prevFromPoint.copy(clickPosition);
      this.centre.fromPoint.copy(clickPosition);
      this.centre.toPoint.copy(clickPosition);
      this.centre.nextToPoint = null;
      for (let i = 0; i < 10; ++i) {
        this.updateCentreNextToPoint();
      }
      this.centre.steps = this.centre.maxSteps;
    });
    window.addEventListener('wheel', event => {
      this.zoomSetting += event.deltaY;
    });

    this.wanderers = [
      this.centre,
      this.xDirGuide,
      this.yDirGuide,
    ];
  }

  static update(time) {
    this.updateCentreNextToPoint();

    for (const wanderer of this.wanderers) {
      wanderer.update();
    }

    this.uniformData = new Float32Array([
      ...this.wanderers.flatMap(
        wanderer => wanderer.currentPoint.toArray()
      ),
      /*zoom=*/this.getZoom(),
    ]);
  }

  static getZoom() {
    return 2 ** (this.zoomSetting / 400);
  }

  static randomVec4() {
    const distance = Math.min(0.5, 2 * this.getZoom());
    return new Vec4(
      deviate(distance),
      deviate(distance),
      deviate(distance),
      deviate(distance),
    );
  }

  static updateCentreNextToPoint() {
    const candidate = this.centre.toPoint.add(this.randomVec4());

    const candidateScores = getCandidateScores(
      this.xDirGuide.currentPoint,
      this.yDirGuide.currentPoint,
      this.centre.fromPoint,
      this.centre.toPoint,
      candidate,
    );

    if (this.centre.nextToPoint === null || sum(candidateScores) > sum(this.bestCandidateScores)) {
      this.centre.nextToPoint = candidate;
      this.bestCandidateScores = candidateScores;
    }
  }

  static debugRender(context) {
    context.lineWidth = 1;
    context.strokeStyle = 'white';
    context.save();
    context.translate(innerWidth / 2, innerHeight / 2);
    context.beginPath();
    context.arc(0, 0, debugUnitRadius, 0, TAU);
    context.moveTo(-debugUnitRadius, 0);
    context.lineTo(debugUnitRadius, 0);
    context.moveTo(0, -debugUnitRadius);
    context.lineTo(0, debugUnitRadius);
    context.stroke();

    context.fillStyle = 'white';
    context.fillText(`centre: ${this.centre.currentPoint.toArray()}`, -debugUnitRadius, -debugUnitRadius - 20);
    context.fillText(`bestCandidateScores: ${this.bestCandidateScores}`, -debugUnitRadius, -debugUnitRadius - 10);
    context.fillText(`zoom: ${this.getZoom()}`, -debugUnitRadius, -debugUnitRadius + 0);
    context.fillText(`zoomSetting: ${this.zoomSetting}`, -debugUnitRadius, -debugUnitRadius + 10);
    context.fillRect(this.clickX * debugUnitRadius, -this.clickY * debugUnitRadius, 2, 2);

    context.restore();

    for (const wanderer of this.wanderers) {
      wanderer.debugRender(context);
    }
  }
}

function collectInsideSamples(prevFromPoint, fromPoint, toPoint) {
  const sampleCount = 20;
  const maxIterationCount = 50;
  const samples = [];
  for (let i = 0; i < sampleCount; ++i) {
    const samplePosition = smoothPointLerp(
      prevFromPoint,
      fromPoint,
      toPoint,
      i / sampleCount,
    );
    let zr = samplePosition.x;
    let zi = samplePosition.y;
    const cr = samplePosition.z;
    const ci = samplePosition.w;
    let inside = true;
    for (let iteration = 0; iteration < maxIterationCount; ++iteration) {
      [zr, zi] = [
        zr * zr - zi * zi + cr,
        2 * zr * zi + ci,
      ];
      if (zr * zr + zi * zi >= 4) {
        inside = false;
        break;
      }
    }
    samples.push(inside);
  }
  return samples;
}

function getCandidateScores(xDirGuidePoint, yDirGuidePoint, prevFromPoint, fromPoint, candidate) {
  let scores = [];

  const samples = collectInsideSamples(
    prevFromPoint,
    fromPoint,
    candidate,
  );
  const otherHalfSamples = samples.splice(0, samples.length / 2);
  for (const half of [samples, otherHalfSamples]) {
    const insideCount = half.filter(inside => inside).length;
    scores.push(10 * -Math.abs((insideCount / half.length) - 0.75));
  }

  // const direction = candidate.subtract(fromPoint).normalise();
  // for (const dirGuidePoint of [xDirGuidePoint, yDirGuidePoint]) {
  //   scores.push(1 * Math.abs(direction.dot(dirGuidePoint.normalise())));
  // }

  return scores;
}

function sum(xs) {
  let result = 0;
  for (const x of xs) {
    result += x;
  }
  return result;
}

class Wanderer {
  constructor({maxSteps, maxSize, minSize, debugColour}) {
    this.maxSteps = maxSteps;
    this.maxSize = maxSize;
    this.minSize = minSize;
    this.debugColour = debugColour;

    this.prevFromPoint = this.randomVec4();
    this.fromPoint = this.randomVec4();
    this.toPoint = this.randomVec4();
    this.nextToPoint = null;
    this.currentPoint = null;
    this.step = 0;
    this.update();
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
      if (!this.nextToPoint) {
        this.nextToPoint =  this.randomVec4();
      }
      this.toPoint = this.nextToPoint;
      this.nextToPoint = null;
      this.step = 0;
    }
    this.currentPoint = smoothPointLerp(this.prevFromPoint, this.fromPoint, this.toPoint, this.step / this.maxSteps);
  }

  debugRender(context) {
    context.lineWidth = 2;

    context.fillStyle = this.debugColour;
    context.beginPath();
    this.debugPathBox(context, this.currentPoint.x, this.currentPoint.y);
    context.fill();

    context.strokeStyle = this.debugColour;
    context.beginPath();
    this.debugPathBox(context, this.currentPoint.z, this.currentPoint.w);
    context.stroke();

    context.beginPath();
    context.moveTo(
      innerWidth / 2 + this.currentPoint.x * debugUnitRadius,
      innerHeight / 2 - this.currentPoint.y * debugUnitRadius,
    );
    context.lineTo(
      innerWidth / 2 + this.toPoint.x * debugUnitRadius,
      innerHeight / 2 - this.toPoint.y * debugUnitRadius,
    );
    if (this.nextToPoint) {
      context.lineTo(
        innerWidth / 2 + this.nextToPoint.x * debugUnitRadius,
        innerHeight / 2 - this.nextToPoint.y * debugUnitRadius,
      );
    }
    context.moveTo(
      innerWidth / 2 + this.currentPoint.z * debugUnitRadius,
      innerHeight / 2 - this.currentPoint.w * debugUnitRadius,
    );
    context.lineTo(
      innerWidth / 2 + this.toPoint.z * debugUnitRadius,
      innerHeight / 2 - this.toPoint.w * debugUnitRadius,
    );
    if (this.nextToPoint) {
      context.lineTo(
        innerWidth / 2 + this.nextToPoint.z * debugUnitRadius,
        innerHeight / 2 - this.nextToPoint.w * debugUnitRadius,
      );
    }
    context.stroke();
  }

  debugPathBox(context, x, y) {
    const boxSize = 10;
    context.rect(
      innerWidth / 2 + x * debugUnitRadius - boxSize / 2,
      innerHeight / 2 - y * debugUnitRadius - boxSize / 2,
      boxSize,
      boxSize,
    );
  }
}

function deviate(x) {
  return (Math.random() * 2 - 1) * x;
}

function smooth(x) {
  return x <= 0.5 ? x ** 2 * 2 : 1 - (1 - x) ** 2 * 2;
}

function smoothPointLerp(prevFromPoint, fromPoint, toPoint, progress) {
  const projectedPoint = fromPoint.add(fromPoint.subtract(prevFromPoint).scale(progress));
  const trajectoryPoint = fromPoint.add(toPoint.subtract(fromPoint).scale(progress));
  return projectedPoint.lerp(trajectoryPoint, smooth(progress));
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

  normalise() {
    return this.scale(1 / this.length());
  }

  dot(other) {
    return (
      this.x * other.x +
      this.y * other.y +
      this.z * other.z +
      this.w * other.w
    );
  }
}