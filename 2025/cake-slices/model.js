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
    // planeCuts.sort((a, b) => getCheapAngle(a) - getCheapAngle(b));

    const result = [];
    for (let i = 0; i < planeCuts.length; ++i) {
      const arcStart = planeCuts[i];
      const arcStartNormal = Vec3.temp().setTurnXy(arcStart);
      const arcEnd = planeCuts[(i + 1) % planeCuts.length];
      const arcEndNormal = Vec3.temp().setUnturnXy(arcEnd);

      const arcFaces = [];
      for (const face of this.faces) {
        const arcFacePositions = [];
        for (let j = 0; j < face.positions.length; ++j) {
          const startPosition = face.positions[j];
          const endPosition = face.positions[(j + 1) % face.positions.length];

          const startProjected = Vec3.temp().set2dPlaneProjection(planeBasis, startPosition);
          const endProjected = Vec3.temp().set2dPlaneProjection(planeBasis, endPosition);

          // Start is inside arc.
          if (startProjected.dot(arcStartNormal) >= 0 && startProjected.dot(arcEndNormal) > 0) {
            arcFacePositions.push(new Vec3().set(startPosition));
          }

          // Intersection with arc start direction is on edge.
          const startArcIntersectT = getSegmentIntersectionT(startProjected, endProjected, arcStartNormal);
          if (startArcIntersectT >= 0
              && startArcIntersectT < 1
              && Vec3.temp().setLerp(startProjected, endProjected, startArcIntersectT).dot(arcStart) > 0) {
            arcFacePositions.push(new Vec3().setLerp(startPosition, endPosition, startArcIntersectT));
          }

          // Intersection with arc end direction is on edge.
          const endArcIntersectT = getSegmentIntersectionT(startProjected, endProjected, arcEndNormal);
          if (endArcIntersectT >= 0
              && endArcIntersectT < 1
              && Vec3.temp().setLerp(startProjected, endProjected, endArcIntersectT).dot(arcEnd) > 0) {
            arcFacePositions.push(new Vec3().setLerp(startPosition, endPosition, endArcIntersectT));
          }
        }

        // Compute intersection of slice direction with face.
        const faceNormal = Vec3.temp().setCross(
          Vec3.temp().setDelta(face.positions[0], face.positions[1]),
          Vec3.temp().setDelta(face.positions[1], face.positions[2]),
        ).inplaceNormalise();
        const middleIntersectionT = getRayIntersectionT(
          Vec3.temp().setSubtract(position, face.positions[0]),
          direction,
          faceNormal,
        );
        if (Math.abs(middleIntersectionT) < Infinity) {
          const middle = Vec3.temp().setScaleAdd(position, middleIntersectionT, direction);
          // TODO: Test if middle is on face.
          arcFacePositions.push(new Vec3().set(middle));
        }

        // Push sliced face outwards by distance.
        const push = Vec3.temp().setRelative3dPlanePosition(
          planeBasis,
          Vec3.temp().setAdd(arcStart, arcEnd).inplaceNormalise(),
        ).inplaceScale(distance);
        for (const position of arcFacePositions) {
          position.inplaceAdd(push);
        }

        // TODO: Sort arcFacePositions by simple angle.

        if (arcFacePositions.length > 0) {
          arcFaces.push({
            size: 10,
            colour: {r: 255, g: 255, b: 255},
            positions: arcFacePositions,
          });
        }
      }

      // TODO: Compute and add arc start and end slice faces.

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
}