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
        Mat4.b.setTranslateXyz(0, 0, 250),
        Mat4.a.setRotateZx(time / 5000),
      )
      .exportToArrayBuffer(hexLines.transformMatrix);

    for (let i = 0; i < rootCount; ++i) {
      let depth = 1;
      let current = roots[i];
      while (current !== null) {
        current.articulatedAngle =
          Math.sin(i + depth + time / (1000 + depth * 100))
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

  draw(hexLines, depth, baseAxis, baseDirection) {
    this.sideDirection.setCross(baseAxis, baseDirection);

    this.articulatedDirection.setSum(
      Math.cos(this.articulatedAngle),
      baseDirection,
      Math.sin(this.articulatedAngle),
      this.sideDirection,
    );

    this.endAxis.setSum(
      this.cosArc,
      baseAxis,
      this.sinArc,
      this.articulatedDirection,
    );

    this.endDirection.setSum(
      -this.sinArc,
      baseAxis,
      this.cosArc,
      this.articulatedDirection,
    );

    const straightArcDirection = Vec3.a.setDelta(
      Vec3.b.setScale(this.startRadius, baseAxis),
      Vec3.c.setScale(this.startRadius, this.endAxis),
    ).inplaceNormalise();

    const size = 5;
    const g = 255 / (1 + depth / 1.5);
    const r = Math.min(g, (255 - g) / 15);
    const b = r;
    const margin = 5;
    addPoint(
      hexLines,
      Vec3.sum(this.startRadius, baseAxis, margin, straightArcDirection),
      size, r, g, b,
    );
    addPoint(
      hexLines,
      Vec3.sum(this.startRadius, this.endAxis, -margin, straightArcDirection),
      size, r, g, b,
    );
    addPoint(
      hexLines,
      Vec3.sum(this.endRadius, this.endAxis, -margin, straightArcDirection),
      size, r, g, b,
    );
    addPoint(
      hexLines,
      Vec3.sum(this.endRadius, baseAxis, margin, straightArcDirection),
      size, r, g, b,
    );
    addPoint(
      hexLines,
      Vec3.sum(this.startRadius, baseAxis, margin, straightArcDirection),
      size, r, g, b,
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