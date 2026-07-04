import {HexLinesContext} from '../../third-party/hex-lines/src/hex-lines.js';
import {Vec3} from '../../third-party/ga/vec3.js';
import {Mat4} from '../../third-party/ga/mat4.js';
import {Rotor3} from '../../third-party/ga/rotor3.js';

const TAU = Math.PI * 2;

async function main() {
  const {hexLinesContext} = HexLinesContext.setupFullPageContext({is3d: true});
  const hexLines = hexLinesContext.createLines();
  const path = new Path();
  const camera = new Camera(path);

  while (true) {
    await new Promise(requestAnimationFrame);
    path.step();
    hexLines.clear();
    path.render(hexLines);
    Mat4.multiply(
      Mat4.a.setRotateRotor3(Rotor3.conjugate(path.segments[0].orientation)),
      Mat4.b.setTranslateVec3(Vec3.scale(-1, path.segments[0].position)),
    ).exportToArrayBuffer(hexLines.transformMatrix);
    hexLines.draw();
  }
}

class Path {
  constructor() {
    this.stepCount = 0;
    this.segments = [];
    this.targetSegmentCount = 1000;
    this.position = new Vec3();
    this.orientation = new Rotor3();
  }

  step() {
    this.segments.shift();
    while (this.segments.length < this.targetSegmentCount) {
      ++this.stepCount;
      this.orientation.inplaceMultiplyLeft(Rotor3.axisAngle(Vec3.polar((this.stepCount) / 40), 0.01));
      this.position.inplaceAdd(Vec3.z().inplaceRotateRotor3(this.orientation).inplaceScale(10));
      this.segments.push(new Segment(this.position.clone(), this.orientation.clone()));
    }
  }

  render(hexLines) {
    for (const segment of this.segments) {
      segment.render(hexLines);
    }
  }
}

class Segment {
  constructor(position, orientation) {
    this.position = position;
    this.orientation = orientation;
  }

  render(hexLines) {
    const ringSegmentCount = 10;
    const ringRadius = 100;
    for (let i = 0; i <= ringSegmentCount; ++i) {
      hexLines.addPoint({
        position: Vec3.polar(i / ringSegmentCount * TAU, ringRadius).inplaceRotateRotor3(this.orientation).inplaceAdd(this.position),
        size: 1,
        colour: {r: 255, g: 255, b: 255},
      });
    }
    hexLines.addNull();
  }
}

class Camera {
}

main();