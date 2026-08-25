import {HexLinesContext} from '../../third-party/hex-lines/src/hex-lines.js';
import {Vec3} from '../../third-party/ga/vec3.js';
import {Mat4} from '../../third-party/ga/mat4.js';

const TAU = Math.PI * 2;

async function main() {
  const {hexLinesContext} = HexLinesContext.setupFullPageContext({is3d: true});
  const hexLines = hexLinesContext.createLines();

  const rootCount = 3;
  const armCount = 38;
  const roots = [];
  const arcDecay = 1;
  const radiusDecay = 0.94;
  const marginDecay = 0.99;
  for (let i = 0; i < rootCount; ++i) {
    let root = null;
    let previous = null;
    let arc = 0.7;
    let startRadius = 130;
    let endRadius = 180;
    let margin = 5;
    for (let j = 0; j < armCount; ++j) {
      const articulation = new Articulation(arc, 0, margin, startRadius, endRadius);
      arc *= arcDecay;
      margin *= marginDecay;
      startRadius *= radiusDecay;
      endRadius *= radiusDecay;
      arc *= radiusDecay;
      if (root === null) {
        root = articulation;
      } else {
        previous.next = articulation;
      }
      previous = articulation;
    }
    roots.push(root);
  }

  const centrePointCount = 40;
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
  const starPoints = 6;
  const starRadius = 14;
  const starSpaceSize = 10000;
  for (let i = 0; i < starCount; ++i) {
    const star = [];
    const spacePosition = Vec3.xyz(
      deviate(starSpaceSize / 2) + deviate(starSpaceSize / 2),
      deviate(starSpaceSize / 2) + deviate(starSpaceSize / 2),
      deviate(starSpaceSize / 2) + deviate(starSpaceSize / 2),
    );
    for (let j = 0; j < starPoints; ++j) {
      star.push(
        new Vec3(deviate(starRadius), deviate(starRadius), deviate(starRadius))
          .inplaceAdd(spacePosition)
      );
    }
    stars.push(star);
  }

  const baseAxis = new Vec3().setZ(1);

  while (true) {
    const time = await new Promise(requestAnimationFrame);

    Mat4
      .multiply(
        Mat4.c.setRotateYz(-0.2),
        Mat4.a.setTranslateXyz(0, -50, 250),
      ).inplaceMultiplyRight(
        Mat4.b.setRotateZx(-(time + 1000) / 3000),
      )
      .exportToArrayBuffer(hexLines.transformMatrix);

    for (let i = 0; i < rootCount; ++i) {
      let depth = 1;
      let current = roots[i];
      while (current !== null) {
        current.articulatedAngle =
          Math.sin(i + depth + time / (500 + (i + depth) * 80))
          * TAU * ((depth / 6 + 0.75 * Math.sin(i + time / 5000))) / 10
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
        addPoint(hexLines, point, 8, 200, 50, 255);
      }
      hexLines.addNull();
    }

    for (let i = 0; i < rootCount; ++i) {
      roots[i].draw(hexLines, 0, baseAxis, new Vec3().setPolar(TAU * i / rootCount));
    }

    hexLines.draw();
  }
}

class Articulation {
  constructor(arc, articulatedAngle, margin, startRadius, endRadius) {
    this.cosArc = Math.cos(arc);
    this.sinArc = Math.sin(arc);
    this.articulatedAngle = articulatedAngle;
    this.margin = margin;
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

    const size = 5;
    const startG = 255 / (1 + depth / 1.2);
    const startB = Math.min(startG, (255 - startG) / 5);
    const startR = startB / 4;
    const endG = 255 / (1 + (depth + 1) / 1.2);
    const endB = Math.min(endG, (255 - endG) / 5);
    const endR = endB / 4;
    addPoint(
      hexLines,
      Vec3.sum(this.startRadius, startAxis, this.margin, straightArcDirection),
      size, startR, startG, startB,
    );
    addPoint(
      hexLines,
      Vec3.sum(this.startRadius, this.endAxis, -this.margin, straightArcDirection),
      size, endR, endG, endB,
    );
    addPoint(
      hexLines,
      Vec3.sum(this.endRadius, this.endAxis, -this.margin, straightArcDirection),
      size, endR, endG, endB,
    );
    addPoint(
      hexLines,
      Vec3.sum(this.endRadius, startAxis, this.margin, straightArcDirection),
      size, startR, startG, startB,
    );
    addPoint(
      hexLines,
      Vec3.sum(this.startRadius, startAxis, this.margin, straightArcDirection),
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