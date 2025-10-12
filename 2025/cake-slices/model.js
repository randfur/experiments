import {Vec3} from '../third-party/ga/vec3.js';
import {PlaneBasis} from '../third-party/ga/plane-basis.js';

class Model {
  constructor(faces) {
    this.faces = faces;
  }

  split({position, direction, cuts, distance}) {
    const planeBasis = PlaneBasis.temp(position, direction);
    const planeCuts = cuts.map(cut => Vec3.temp().setRelative2dPlaneProjection(planeBasis, cut).inplaceNormalise());
    planeCuts.sort((a, b) => getCheapAngle(a) - getCheapAngle(b));
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
    ? (float(v.x < 0.) * 4.) + 1. + (v.y / v.x)
    : (float(v.y < 0.) * 4.) + 3. - (v.x / v.y);
}