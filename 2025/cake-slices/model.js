import {Vec3} from '../third-party/ga/vec3.js';
import {PlaneBasis} from '../third-party/ga/plane-basis.js';

export class Model {
  constructor(faces) {
    this.faces = faces;
    for (const face of faces) {
      for (const position of face.positions) {
        console.assert(!isNaN(position.x));
        console.assert(!isNaN(position.y));
        console.assert(!isNaN(position.z));
      }
    }
  }

  slice({position, direction, cuts, distance}) {
    const planeBasis = PlaneBasis.temp(position, direction);
    const planeCuts = cuts.map(cut => Vec3.temp().setRelative2dPlaneProjection(planeBasis, cut).inplaceNormalise());
    planeCuts.sort((a, b) => getCheapAngle(a) - getCheapAngle(b));

    const result = [];
    for (let i = 0; i < planeCuts.length; ++i) {
      const arcStart = planeCuts[i];
      const arcStartNormal = Vec3.temp().setTurnXy(arcStart);
      const arcEnd = planeCuts[(i + 1) % planeCuts.length];
      const arcEndNormal = Vec3.temp().setUnturnXy(arcEnd);

      const arcStartFacePositions = [];
      const arcEndFacePositions = [];
      // TODO: Fix glitchy arc start/end faces.
      // const arcFacePositionsList = [arcStartFacePositions, arcEndFacePositions];
      const arcFacePositionsList = [];
      for (const face of this.faces) {
        const arcFacePositions = [];

        // Compute intersection of slice direction with face.
        console.assert(face.positions.length > 2);
        const faceNormal = Vec3.temp().setCross(
          Vec3.temp().setDelta(face.positions[0], face.positions[1]),
          Vec3.temp().setDelta(face.positions[1], face.positions[2]),
        ).inplaceNormalise();
        const middleIntersectionT = getRayIntersectionT(
          Vec3.temp().setSubtract(position, face.positions[0]),
          direction,
          faceNormal,
        );
        let middle = null;
        if (Math.abs(middleIntersectionT) < Infinity) {
          middle = Vec3.temp().setScaleAdd(position, middleIntersectionT, direction);
          if (!isInsideFace(middle, face.positions, faceNormal)) {
            middle = null;
          }
        }
        let wasOutsideArc = null;
        function maybeAddMiddle() {
          if (middle !== null && wasOutsideArc === true) {
            arcStartFacePositions.push(middle.clone());
            arcFacePositions.push(middle.clone());
            arcEndFacePositions.push(middle.clone());
            middle = null;
          }
        }

        for (let j = 0; j < face.positions.length; ++j) {
          const startPosition = face.positions[j];
          const endPosition = face.positions[(j + 1) % face.positions.length];

          const startProjected = Vec3.temp().set2dPlaneProjection(planeBasis, startPosition);
          const endProjected = Vec3.temp().set2dPlaneProjection(planeBasis, endPosition);

          const startInsideArc = startProjected.dot(arcStartNormal) >= 0 && startProjected.dot(arcEndNormal) > 0;
          if (startInsideArc) {
            maybeAddMiddle();
            arcFacePositions.push(new Vec3().set(startPosition));
          } else {
            wasOutsideArc = true;
          }

          let intersectionsAdded = 0;

          // Intersection with arc start direction is on edge.
          const startArcIntersectT = getSegmentIntersectionT(startProjected, endProjected, arcStartNormal);
          if (startArcIntersectT >= 0
              && startArcIntersectT < 1
              && Vec3.temp().setLerp(startProjected, endProjected, startArcIntersectT).dot(arcStart) > 0) {
            maybeAddMiddle();
            ++intersectionsAdded;
            const position = new Vec3().setLerp(startPosition, endPosition, startArcIntersectT);
            arcStartFacePositions.push(position.clone());
            arcFacePositions.push(position);
          }

          // Intersection with arc end direction is on edge.
          const endArcIntersectT = getSegmentIntersectionT(startProjected, endProjected, arcEndNormal);
          if (endArcIntersectT >= 0
              && endArcIntersectT < 1
              && Vec3.temp().setLerp(startProjected, endProjected, endArcIntersectT).dot(arcEnd) > 0) {
            maybeAddMiddle();
            ++intersectionsAdded;
            const position = new Vec3().setLerp(startPosition, endPosition, endArcIntersectT);
            arcFacePositions.push(position.clone());
            arcEndFacePositions.push(position);
          }

          // Swap intersections if they were added backwards.
          if (intersectionsAdded === 2 && endArcIntersectT < startArcIntersectT) {
            const temp = arcFacePositions[arcFacePositions.length - 1];
            arcFacePositions[arcFacePositions.length - 1] = arcFacePositions[arcFacePositions.length - 2];
            arcFacePositions[arcFacePositions.length - 2] = temp;
          }
        }

        if (arcFacePositions.length > 0) {
          arcFacePositionsList.push(arcFacePositions);
        }
      }

      // How far to push the faces out for the arc segment.
      const arcPush = Vec3.temp().setRelative3dPlanePosition(
        planeBasis,
        Vec3.temp().setAdd(arcStart, arcEnd).inplaceNormalise(),
      ).inplaceScale(distance);

      sortConvexByAngle(arcStartFacePositions);
      sortConvexByAngle(arcEndFacePositions);

      const arcFaces = [];
      for (const facePositions of arcFacePositionsList) {
        for (const position of facePositions) {
          position.inplaceAdd(arcPush);
        }

        if (facePositions.length > 0) {
          arcFaces.push({
            size: 10,
            colour: {r: 255, g: 255, b: 255},
            positions: facePositions,
          });
        }
      }

      if (arcFaces.length > 0) {
        result.push(new Model(arcFaces));
      }
    }

    return result;
  }

  draw(hexLines) {
    for (const face of this.faces) {
      for (let i = 0; i <= face.positions.length; ++i) {
        const {x, y, z} = face.positions[i % face.positions.length];
        const {r, g, b} = face.colour;
        hexLines.addPointFlat(x, y, z, face.size, r, g, b, 255);
      }
      hexLines.addNull();
    }
  }
}

function isInsideFace(position, facePositions, faceNormal) {
  const facePlaneBasis = PlaneBasis.temp(facePositions[0], faceNormal);
  const position2d = Vec3.temp().set2dPlaneProjection(facePlaneBasis, position);

  const facePosition2d0 = Vec3.temp().set2dPlaneProjection(facePlaneBasis, facePositions[0]);
  const facePosition2d1 = Vec3.temp().set2dPlaneProjection(facePlaneBasis, facePositions[1]);
  const facePosition2d2 = Vec3.temp().set2dPlaneProjection(facePlaneBasis, facePositions[2]);
  const sign = Math.sign(
    Vec3.temp()
    .setDelta(facePosition2d0, facePosition2d1)
    .dot(Vec3.temp().setDelta(facePosition2d1, facePosition2d2).inplaceUnturnXy())
  );

  for (let i = 0; i < facePositions.length; ++i) {
    const edgeStart2d = Vec3.temp().set2dPlaneProjection(facePlaneBasis, facePositions[i]);
    const edgeNormal2d = Vec3.temp()
      .setDelta(facePositions[i], facePositions[(i + 1) % facePositions.length])
      .inplaceRelative2dPlaneProjection(facePlaneBasis)
      .inplaceTurnXy();

    if (Vec3.temp().setDelta(edgeStart2d, position2d).dot(edgeNormal2d) * sign < 0) {
      return false;
    }
  }
  return true;
}

function getRayIntersectionT(position, direction, normal) {
  // I = P + tD
  // I.N = 0
  // (P + tD).N = 0
  // P.N + tD.N = 0
  // t = -P.N / D.N
  return -position.dot(normal) / direction.dot(normal);
}

function getSegmentIntersectionT(a, b, normal) {
  return getRayIntersectionT(a, Vec3.temp().setDelta(a, b), normal);
}

function getCheapAngle(v) {
  return Math.abs(v.x) > Math.abs(v.y)
    ? (v.x < 0 ? 4 : 0) + 1 + (v.y / v.x)
    : (v.y < 0 ? 4 : 0) + 3 - (v.x / v.y);
  // return Math.atan2(v.y, v.x);
}

const sortConvexByAngle = (() => {
  const normal = new Vec3();
  const edge0 = new Vec3();
  const edge1 = new Vec3();
  const planeBasis = new PlaneBasis();
  const middle2d = new Vec3();
  const position2d = new Vec3();
  const positionA2d = new Vec3();
  const positionB2d = new Vec3();

  return positions => {
    if (positions.length === 0) {
      return;
    }
    console.assert(positions.length > 2);
    normal.setCross(
      edge0.setDelta(positions[0], positions[1]),
      edge1.setDelta(positions[1], positions[2]),
    ).inplaceNormalise();

    planeBasis.set(positions[0], normal);

    middle2d.setZero();
    for (const position of positions) {
      middle2d.inplaceAdd(position2d.set2dPlaneProjection(planeBasis, position));
    }
    middle2d.inplaceScale(1 / positions.length);

    positions.sort((a, b) => (
      getCheapAngle(positionA2d.set2dPlaneProjection(planeBasis, a).inplaceSubtract(middle2d))
      - getCheapAngle(positionB2d.set2dPlaneProjection(planeBasis, b).inplaceSubtract(middle2d))
    ));
  }
})();