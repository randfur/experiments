import {Vec3} from '../third-party/ga/vec3.js';
import {PlaneBasis} from '../third-party/ga/plane-basis.js';

export class Model {
  constructor(faces) {
    this.faces = faces;
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

      const arcFaces = [];
      for (const face of this.faces) {
        const arcPositions = [];
        for (let j = 0; j < face.positions.length; ++j) {
          const startPosition = face.positions[j];
          const endPosition = face.positions[(j + 1) % face.positions.length];

          const startProjected = Vec3.temp().set2dPlaneProjection(planeBasis, startPosition);
          const endProjected = Vec3.temp().set2dPlaneProjection(planeBasis, endPosition);

          const isStartInside = startProjected.dot(arcStartNormal) >= 0 && startProjected.dot(arcEndNormal) > 0;
          const isEndInside = endProjected.dot(arcStartNormal) >= 0 && endProjected.dot(arcEndNormal) > 0;

          if (isStartInside) {
            arcPositions.push(startPosition.clone());
          }

          if (isStartInside != isEndInside) {
            // const intersectPosition
            // arcPositions.push();
            // TODO: Calculate intersection with arc start plane.
          }
        }
        // TODO: Calculate intersection with direction and face plane and add if inside.
        if (arcPositions.length > 0) {
          arcFaces.push({
            size: 10,
            colour: {r: 255, g: 255, b: 255},
            positions: arcPositions,
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

function getCheapAngle(v) {
  return Math.abs(v.x) > Math.abs(v.y)
    ? (v.x < 0 ? 4 : 0) + 1 + (v.y / v.x)
    : (v.y < 0 ? 4 : 0) + 3 - (v.x / v.y);
}