import {Vec3} from '../../third-party/ga/vec3.js';
import {Rotor3} from '../../third-party/ga/rotor3.js';
import {Point} from './point.js';

const TAU = Math.PI * 2;

export class Path {
  constructor(pointCount, pointStepDistance, styles) {
    this.pointCount = pointCount;
    this.pointStepDistance = pointStepDistance;
    this.styles = styles;
    // WIP
    // Have two styles to crossfade between.
    this.style = new styles[0]();

    this.start = new Point();

    this.startIndex = 0;
    this.points = [];
    for (let i = 0; i < this.pointCount; ++i) {
      this.points.push(new Point());
      this.setNextPoint(i);
    }
    this.start.set(this.points[0]);
  }

  progressCamera(time) {
    // WIP
    // if (this.style === null) {
    // }
    const distance = this.style.progressCamera(time);

    let remainingDistance = distance;
    let previousDistance = this.start.distance;
    let deleteCount = 0;
    for (let i = 0; i < this.pointCount; ++i) {
      const segmentDistance = this.getPointByIndex(i).distance - previousDistance;
      if (remainingDistance > segmentDistance) {
        remainingDistance -= segmentDistance;
        ++deleteCount;
      } else {
        break;
      }
    }

    if (deleteCount >= this.pointCount) {
      this.startIndex = 0;
      this.start = new Point();
      for (let i = 0; i < deleteCount; ++i) {
        this.setNextPoint(i);
      }
      return;
    }

    if (deleteCount > 0) {
      this.start.set(this.points[(this.startIndex + deleteCount - 1) % this.pointCount]);
    }
    for (let i = 0; i < deleteCount; ++i) {
      this.setNextPoint(this.startIndex)
      this.startIndex = (this.startIndex + 1) % this.pointCount;
    }

    const startPoint = this.points[this.startIndex];
    const overShoot = remainingDistance / (startPoint.distance - this.start.distance);
    this.start.setLerp(this.start, startPoint, overShoot);

    for (const point of this.points) {
      point.distance -= this.start.distance;
      point.position.inplaceSubtract(this.start.position);
    }
    this.style.subtractStart(this.start);
    this.start.distance = 0;
    this.start.position.setZero();
  }

  setNextPoint(index) {
    // TODO: Merging two styles together.
    this.points[index].set(this.style.getNextPoint(this.pointStepDistance));
  }

  getPointByIndex(index) {
    return this.points[(this.startIndex + index + this.pointCount) % this.pointCount];
  }

  getPointByDistance(distance) {
    if (distance <= this.getPointByIndex(0).distance) {
      return getPointReturnValue.setLerp(this.getPointByIndex(0), this.getPointByIndex(1), (distance - this.getPointByIndex(0).distance) / this.pointStepDistance);
    }
    if (distance >= this.getPointByIndex(-1).distance) {
      return getPointReturnValue.setLerp(
        this.getPointByIndex(-2),
        this.getPointByIndex(-1),
        (distance - this.getPointByIndex(-1).distance) / this.pointStepDistance,
      );
    }
    const index = Math.floor((distance - this.getPointByIndex(0).distance) / this.pointStepDistance);
    return getPointReturnValue.setLerp(
      this.getPointByIndex(index),
      this.getPointByIndex(index + 1),
      (distance - this.getPointByIndex(index).distance) / this.pointStepDistance,
    );
  }

  render(hexLines, time) {
    this.style.render(hexLines, time, this, this.start.distance, this.getPointByIndex(-1).distance);
  }
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

const getPointReturnValue = new Point();
