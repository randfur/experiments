import {HexLinesContext} from '../../third-party/hex-lines/src/hex-lines.js';
import {Vec3} from '../../third-party/ga/vec3.js';
import {Mat4} from '../../third-party/ga/mat4.js';

const TAU = Math.PI * 2;

async function main() {
  const {hexLinesContext} = HexLinesContext.setupFullPageContext({is3d: true});
  const hexLines = hexLinesContext.createLines();

  const rootCount = 2;
  const armCount = 30;
  const roots = [];
  for (let i = 0; i < rootCount; ++i) {
    let root = null;
    let previous = null;
    for (let j = 0; j < armCount; ++j) {
      const articulation = new Articulation(0.5, i / 100, 100, 150);
      if (root === null) {
        root = articulation;
      } else {
        previous.next = articulation;
      }
      previous = articulation;
    }
    roots.push(root);
  }

  const centrePointCount = 20;
  const centrePoints = [];
  const centreRadius = 10;
  for (let i = 0; i < centrePointCount; ++i) {
    centrePoints.push(
      new Vec3(deviate(centreRadius), deviate(centreRadius), deviate(centreRadius))
        .inplaceRotateXyAngle(TAU / 8)
    );
  }

  const starCount = 500;
  const stars = [];
  const starPoints = 4;
  const starRadius = 10;
  const starSpaceSize = 5000;
  for (let i = 0; i < starCount; ++i) {
    const star = [];
    const spacePosition = Vec3.xyz(deviate(starSpaceSize), deviate(starSpaceSize), deviate(starSpaceSize));
    for (let j = 0; j < starPoints; ++j) {
      star.push(
        new Vec3(deviate(starRadius), deviate(starRadius), deviate(starRadius))
          .inplaceAdd(spacePosition)
      );
    }
    stars.push(star);
  }

  const baseAxis = new Vec3().setX(-1);
  const baseDirection = new Vec3().setZ(-1);

  while (true) {
    const time = await new Promise(requestAnimationFrame);

    Mat4
      .multiply(
        Mat4.c.setRotateYz(-0.2),
        Mat4.a.setTranslateXyz(0, -50, 250),
      ).inplaceMultiplyRight(
        Mat4.b.setRotateZx(-time / 5000),
        // Mat4.b.setRotateZx(0),
      )
      .exportToArrayBuffer(hexLines.transformMatrix);

    for (let i = 0; i < rootCount; ++i) {
      let depth = 1;
      let current = roots[i];
      while (current !== null) {
        current.articulatedAngle =
          Math.sin(i + depth + time / (1000 + (i + depth) * 100))
          * TAU * ((1 + 0.5 * Math.sin(time / 10000))) / 10
          * (depth === 1 ? 0.5 : 1);
        current = current.next;
        ++depth;
      }
    }

    hexLines.clear();

    for (const centrePoint of centrePoints) {
      addPoint(hexLines, centrePoint, 3, 255, 0, 0);
    }
    hexLines.addNull();

    for (const star of stars) {
      for (const point of star) {
        addPoint(hexLines, point, 4, 200, 50, 255);
      }
      hexLines.addNull();
    }

    for (let i = 0; i < rootCount; ++i) {
      roots[i].draw(hexLines, 0, baseAxis, baseDirection.clone().inplaceScale(i ? 1 : -1));
    }

    hexLines.draw();
  }
}

class Articulation {
  constructor(arc, articulatedAngle, startRadius, endRadius) {
    this.cosArc = Math.cos(arc);
    this.sinArc = Math.sin(arc);
    this.articulatedAngle = articulatedAngle;
    this.startRadius = startRadius;
    this.endRadius = endRadius;
    this.next = null;

    this.sideDirection = new Vec3();
    this.articulatedDirection = new Vec3();
    this.endAxis = new Vec3();
    this.endDirection = new Vec3();
  }

  draw(hexLines, depth, startAxis, startDirection) {
    this.sideDirection.setCross(startAxis, startDirection);

    this.articulatedDirection.setSum(
      Math.cos(this.articulatedAngle),
      startDirection,
      Math.sin(this.articulatedAngle),
      this.sideDirection,
    );

    this.endAxis.setSum(
      this.cosArc,
      startAxis,
      this.sinArc,
      this.articulatedDirection,
    );

    this.endDirection.setSum(
      -this.sinArc,
      startAxis,
      this.cosArc,
      this.articulatedDirection,
    );

    const straightArcDirection = Vec3.a.setDelta(
      Vec3.b.setScale(this.startRadius, startAxis),
      Vec3.c.setScale(this.startRadius, this.endAxis),
    ).inplaceNormalise();

    const margin = 5;
    const size = 5;
    const startG = 255 / (1 + depth / 1.5);
    const startR = Math.min(startG, (255 - startG) / 15);
    const startB = startR;
    const endG = 255 / (1 + (depth + 1) / 1.5);
    const endR = Math.min(endG, (255 - endG) / 15);
    const endB = endR;
    addPoint(
      hexLines,
      Vec3.sum(this.startRadius, startAxis, margin, straightArcDirection),
      size, startR, startG, startB,
    );
    addPoint(
      hexLines,
      Vec3.sum(this.startRadius, this.endAxis, -margin, straightArcDirection),
      size, endR, endG, endB,
    );
    addPoint(
      hexLines,
      Vec3.sum(this.endRadius, this.endAxis, -margin, straightArcDirection),
      size, endR, endG, endB,
    );
    addPoint(
      hexLines,
      Vec3.sum(this.endRadius, startAxis, margin, straightArcDirection),
      size, startR, startG, startB,
    );
    addPoint(
      hexLines,
      Vec3.sum(this.startRadius, startAxis, margin, straightArcDirection),
      size, startR, startG, startB,
    );
    hexLines.addNull();

    this.next?.draw?.(hexLines, depth + 1, this.endAxis, this.endDirection);
  }
}

function addPoint(hexLines, v, size, r, g, b) {
  hexLines.addPointFlat(v.x, v.y, v.z, size, r, g, b);
}

function deviate(x) {
  return (Math.random() * 2 - 1) * x;
}

main();