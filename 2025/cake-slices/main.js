import {HexLinesContext} from '../third-party/hex-lines/src/hex-lines.js';
import {Temp} from '../third-party/ga/temp.js';
import {Mat4} from '../third-party/ga/mat4.js';
import {Rotor3} from '../third-party/ga/rotor3.js';
import {Vec3} from '../third-party/ga/vec3.js';
import {PlaneBasis} from '../third-party/ga/plane-basis.js';
import {createBox} from './model.js';

const TAU = Math.PI * 2;

async function main() {
  const {hexLinesContext} = HexLinesContext.setupFullPageContext({is3d: true});
  const hexLines = hexLinesContext.createLines();

  // const box = createBox(Vec3.temp(200, 400, 100), 10, {r: 255, g: 255, b: 255});

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

  const dots = range(100).map(i => new Vec3(0, 0, i));

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

  function drawPlaneBasis(planeBasis) {
    drawUnitVector(planeBasis.origin, planeBasis.xDirection, 50, 4, {r: 255});
    drawUnitVector(planeBasis.origin, planeBasis.yDirection, 50, 4, {g: 255});
    drawUnitVector(planeBasis.origin, planeBasis.normal, 50, 4, {b: 255});
  }

  function isProjectionColliding(face, facePlaneBasis, v) {
    const planePoint = Vec3.temp().set2dPlaneProjection(facePlaneBasis, v);
    const edge = Vec3.temp();
    for (let i = 0; i < face.length; ++i) {
      edge.set

    }
  }

  while (true) {
    const time = await new Promise(requestAnimationFrame);
    Temp.reclaimAll();
    hexLines.clear();

    // Spin camera.
    Mat4.temp()
      .setMultiply(
        Mat4.temp().setTranslateXyz(0, 0, 300),
        Mat4.temp().setRotateZx(time / 4000),
      )
      .exportToArrayBuffer(hexLines.transformMatrix);

    drawFace(faceA, 4, {r: 255, g: 255, b: 255});
    drawPlaneBasis(planeBasisA);
    drawFace(faceB, 4, {r: 255, g: 255, b: 255});
    drawPlaneBasis(planeBasisB);

    for (const dot of dots) {
      dot.x += Math.cos(dot.y);
      dot.y += Math.cos(dot.z);
      dot.z += Math.cos(dot.x);
      hexLines.addDot({position: dot, size: 4, colour: {r: 255, g: 255}});
    }

    // const parts = box.split({
    //   position: Vec3.temp(0, 0, 0),
    //   direction: Vec3.temp(0, 0, 1),
    //   cuts: [
    //     Vec3.temp().setPolarXy(time / 1000),
    //     Vec3.temp().setPolarXy(1 + time / 2000),
    //     Vec3.temp().setPolarXy(2 + time / 3000),
    //   ],
    //   distance: Math.abs(Math.cos(time / 4000)),
    // });

    // for (const part of parts) {
    //   part.draw(hexLines);
    // }

    hexLines.draw();
  }
}

function deviate(x) {
  return x * (Math.random() * 2 - 1);
}

function range(n) {
  const result = [];
  for (let i = 0; i < n; ++i) {
    result.push(i);
  }
  return result;
}

main();