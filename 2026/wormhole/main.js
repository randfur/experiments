import {HexLinesContext} from '../../third-party/hex-lines/src/hex-lines.js';
import {Vec3} from '../../third-party/ga/vec3.js';
import {Mat4} from '../../third-party/ga/mat4.js';
import {Rotor3} from '../../third-party/ga/rotor3.js';

const TAU = Math.PI * 2;

async function main() {
  const {hexLinesContext} = HexLinesContext.setupFullPageContext({is3d: true});
  const hexLines = hexLinesContext.createLines();
  const path = new Path(1000);

  while (true) {
    await new Promise(requestAnimationFrame);
    path.progress(10);
    hexLines.clear();
    path.render(hexLines);
    Mat4.multiply(
      Mat4.a.setRotateRotor3(Rotor3.conjugate(path.start.orientation)),
      Mat4.b.setTranslateVec3(Vec3.scale(-1, path.start.position)),
    ).exportToArrayBuffer(hexLines.transformMatrix);
    hexLines.draw();
  }
}

class Path {
  constructor(pointCount) {
    this.stepCount = 0;

    this.pointCount = pointCount;
    this.startIndex = 0;

    this.start = new PathPoint();
    this.end = new PathPoint();

    this.points = [];
    for (let i = 0; i < this.pointCount; ++i) {
      this.points.push(new PathPoint());
      this.writeNextPoint(i);
    }
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
      this.start = new PathPoint();
      this.end = new PathPoint();
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
    this.start.distance = lerp(this.start.distance, startPoint.distance, overShoot);
    this.start.position.inplaceLerp(startPoint.position, overShoot);
    this.start.orientation.inplaceLerp(startPoint.orientation, overShoot).inplaceNormalise();
  }

  writeNextPoint(index) {
    ++this.stepCount;
    this.end.orientation.inplaceMultiplyLeft(
      Rotor3.axisAngle(
        Vec3.polar((this.stepCount) / 40),
        0.01,
      ),
    );
    const stepDistance = 10;
    this.end.distance += stepDistance;
    this.end.position.inplaceAdd(Vec3.z().inplaceRotateRotor3(this.end.orientation).inplaceScale(stepDistance));
    this.points[index].set(this.end);
  }

  render(hexLines) {
    for (const point of this.points) {
      point.render(hexLines);
    }
  }
}

class PathPoint {
  constructor() {
    this.distance = 0;
    this.position = new Vec3();
    this.orientation = new Rotor3();
  }

  set(other) {
    this.distance = other.distance;
    this.position.set(other.position);
    this.orientation.set(other.orientation);
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
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

main();
