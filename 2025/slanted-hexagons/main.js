import {HexLinesContext} from '../../third-party/hex-lines/src/hex-lines.js';
import {Temp} from '../../third-party/ga/temp.js';
import {Mat4} from '../../third-party/ga/mat4.js';
import {Rotor3} from '../../third-party/ga/rotor3.js';
import {Vec3} from '../../third-party/ga/vec3.js';
import {PlaneBasis} from '../../third-party/ga/plane-basis.js';

const TAU = Math.PI * 2;

async function main() {
  const {hexLinesContext} = HexLinesContext.setupFullPageContext({is3d: true});
  const hexLines = hexLinesContext.createLines();

  const faceA = [
    new Vec3(85, 0, 0),
    new Vec3(50, 50, 50),
    new Vec3(-50, 50, 50),
    new Vec3(-85, 0, 0),
    new Vec3(-50, -50, -50),
    new Vec3(50, -50, -50),
  ];

  const faceB = faceA.map(vertex => vertex.clone().inplaceAdd(Vec3.temp(0, 0, 100))).reverse();

  const planeBasisA = facePlaneBasis(faceA);
  const planeBasisB = facePlaneBasis(faceB);

  const dots = range(100).map(i => new Vec3(0, i * (i % 2 === 0 ? 1 : -1), 0));

  function facePlaneBasis(face) {
    return new PlaneBasis().set(
      face[0],
      Vec3.temp().setCross(
        Vec3.temp().setDelta(face[0], face[1]),
        Vec3.temp().setDelta(face[1], face[2]),
      ),
    );
  }

  function drawFace(face, size, colour) {
    for (let i = 0; i <= face.length; ++i) {
      hexLines.addPoint({
        position: face[i % face.length],
        size: 4,
        colour: {r: 255, g: 255, b: 255},
      });
    }
    hexLines.addNull();
  }

  function drawUnitVector(position, v, length, size, colour) {
    hexLines.addPoint({position, size, colour});
    hexLines.addPoint({
      position: Vec3.temp().setScaleAdd(position, length, v),
      size,
      colour,
    });
    hexLines.addNull();
  }

  function isProjectionColliding(face, facePlaneBasis, v) {
    const planePoint = Vec3.temp().set2dPlaneProjection(facePlaneBasis, v);
    const planePointDelta = Vec3.temp();
    const edgeStart = Vec3.temp();
    const edgeNormal = Vec3.temp();
    for (let i = 0; i < face.length; ++i) {
      edgeStart.set2dPlaneProjection(facePlaneBasis, face[i]);
      edgeNormal.setDelta(face[i], face[(i + 1) % face.length])
        .inplaceRelative2dPlaneProjection(facePlaneBasis)
        .inplaceTurnXy();
      if (planePointDelta.setDelta(edgeStart, planePoint).dot(edgeNormal) < 0) {
        return false;
      }
    }
    return true;
  }

  while (true) {
    const time = await new Promise(requestAnimationFrame);
    Temp.reclaimAll();
    hexLines.clear();

    // Spin camera.
    Mat4.temp().setTranslateXyz(0, 0, 300)
      .inplaceMultiplyRight(Mat4.temp().setRotateZx(time / 1000))
      .exportToArrayBuffer(hexLines.transformMatrix);

    drawFace(faceA, 4, {r: 255, g: 255, b: 255});
    drawFace(faceB, 4, {r: 255, g: 255, b: 255});

    for (const dot of dots) {
      dot.x += Math.cos(dot.y);
      dot.y += Math.cos(dot.z);
      dot.z += Math.cos(dot.x);
      hexLines.addDot({
        position: dot,
        size: 4,
        colour: {r: 100, g: 100, b: 100},
      });
      hexLines.addDot({
        position: Vec3.temp().setPlaneProjection(planeBasisA.origin, planeBasisA.normal, dot),
        size: 4,
        colour: {r: 255, g: 255, b: isProjectionColliding(faceA, planeBasisA, dot) ? 255 : 0},
      });
      hexLines.addDot({
        position: Vec3.temp().setPlaneProjection(planeBasisB.origin, planeBasisB.normal, dot),
        size: 4,
        colour: {r: 255, g: isProjectionColliding(faceB, planeBasisB, dot) ? 255 : 0, b: 255},
      });
    }

    hexLines.draw();
  }
}

function range(n) {
  const result = [];
  for (let i = 0; i < n; ++i) {
    result.push(i);
  }
  return result;
}

main();