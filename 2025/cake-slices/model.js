import {Vec3} from '../third-party/ga/vec3.js';
import {PlaneBasis} from '../third-party/ga/plane-basis.js';

export class Model {
  constructor(faces) {
    this.faces = faces;
  }

  split({position, direction, cuts, distance}) {
    const planeBasis = PlaneBasis.temp(position, direction);
    const planeCuts = cuts.map(cut => Vec3.temp().setRelative2dPlaneProjection(planeBasis, cut).inplaceNormalise());
    planeCuts.sort((a, b) => getCheapAngle(a) - getCheapAngle(b));

    const result = [];
    for (let i = 0; i < planeCuts.length; ++i) {
      const arcStart = planeCuts[i];
      const arcStartNormal = Vec3.temp().setTurnXy(arcStart);
      const arcEnd = planeCuts[(i + 1) % planeCuts.length];
      const arcEndNormal = Vec3.temp().setUnturnXy(arcEnd);

      const slicePositions = [];
      for (const face of this.faces) {
        for (const point of face.positions) {
          const projectedPoint = Vec3.temp().set2dPlaneProjection(planeBasis, point);
          if (projectedPoint.dot(arcStartNormal) >= 0 && projectedPoint.dot(arcEndNormal) > 0) {
            slicePositions.push(point.clone());
          }
        }
      }
      if (slicePositions.length > 0) {
        result.push(new Model([{
          size: 10,
          colour: {r: 255, g: 255, b: 255},
          positions: slicePositions,
        }]));
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