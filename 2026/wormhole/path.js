import {Vec3} from '../../third-party/ga/vec3.js';
import {Rotor3} from '../../third-party/ga/rotor3.js';

const TAU = Math.PI * 2;

export class Path {
  static Point = class Point {
    constructor() {
      this.distance = 0;
      this.position = new Vec3();
      this.orientation = new Rotor3();
    }

    set(other) {
      this.distance = other.distance;
      this.position.set(other.position);
      this.orientation.set(other.orientation);
      return this;
    }

    setLerp(a, b, t) {
      this.distance = lerp(a.distance, b.distance, overShoot);
      this.position.setLerp(a.position, b.position, overShoot);
      this.orientation.setLerp(a.orientation, b.orientation, overShoot).inplaceNormalise();
      return this;
    }

    render(hexLines) {
      const ringSegmentCount = 6;
      const ringRadius = 100;
      for (let i = 0; i <= ringSegmentCount; ++i) {
        hexLines.addPoint({
          position: Vec3.polar((i / ringSegmentCount) * TAU, ringRadius).inplaceRotateRotor3(this.orientation).inplaceAdd(this.position),
          size: 1,
          colour: {r: 255, g: 255, b: 255},
        });
      }
      hexLines.addNull();
    }
  };

  constructor(pointCount, pointStepDistance) {
    this.pointCount = pointCount;
    this.pointStepDistance = pointStepDistance;

    this.stepCount = 0;

    this.startIndex = 0;

    this.points = [];
    for (let i = 0; i < this.pointCount; ++i) {
      this.points.push(new Path.Point());
      this.writeNextPoint(i);
    }

    this.start = new Path.Point().set(this.points[0]);
    this.end = new Path.Point().set(this.points[this.points.length - 1]);
  }

  progress(distance) {
    let remainingDistance = distance;
    let previousDistance = this.start.distance;
    let deleteCount = 0;
    for (let i = 0; i < this.pointCount; ++i) {
      const point = this.points[(this.startIndex + i) % this.pointCount];
      const segmentDistance = point.distance - previousDistance;
      if (remainingDistance > segmentDistance) {
        remainingDistance -= segmentDistance;
        ++deleteCount;
      } else {
        break;
      }
    }

    if (deleteCount >= this.pointCount) {
      this.startIndex = 0;
      this.start = new Path.Point();
      this.end = new Path.Point();
      for (let i = 0; i < deleteCount; ++i) {
        this.writeNextPoint(i);
      }
      return;
    }

    if (deleteCount > 0) {
      this.start.set(this.points[(this.startIndex + deleteCount - 1) % this.pointCount]);
    }
    for (let i = 0; i < deleteCount; ++i) {
      this.writeNextPoint(this.startIndex)
      this.startIndex = (this.startIndex + 1) % this.pointCount;
    }

    const startPoint = this.points[this.startIndex];
    const overShoot = remainingDistance / (startPoint.distance - this.start.distance);
    this.start.setLerp(this.start, startPoint, overShoot);

    for (const point of this.points) {
      point.distance -= this.start.distance;
      point.position.inplaceSubtract(this.start.position);
    }
    this.end.distance -= this.start.distance;
    this.end.position.inplaceSubtract(this.start.position);
    this.start.distance = 0;
    this.start.position.setZero();
  }

  writeNextPoint(index) {
    ++this.stepCount;
    this.end.orientation.inplaceMultiplyLeft(
      Rotor3.axisAngle(
        Vec3.polar((this.stepCount) / 40),
        0.02,
      ),
    );
    this.end.distance += this.pointStepDistance;
    this.end.position.inplaceAdd(Vec3.z().inplaceRotateRotor3(this.end.orientation).inplaceScale(this.pointStepDistance));
    this.points[index].set(this.end);
  }

  getPoint(distance) {
    if (distance <= this.points[0].distance) {
      return getPointReturnValue.setLerp(this.points[0], this.points[1], (distance - this.points[0].distance) / this.pointStepDistance);
    }
    if (distance >= this.points[this.points.length - 1].distance) {
      return getPointReturnValue.setLerp(
        this.points[this.points.length - 2],
        this.points[this.points.length - 1],
        (distance - this.points[this.points.length - 1].distance) / this.pointStepDistance,
      );
    }
    const index = Math.floor((distance - this.points[0].distance) / this.pointStepDistance);
    return getPointReturnValue.setLerp(
      this.points[index],
      this.points[index + 1],
      (distance - this.points[index].distance) / this.pointStepDistance,
    );
  }

  render(hexLines) {
    for (const point of this.points) {
      point.render(hexLines);
    }
  }
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

const getPointReturnValue = new Path.Point();