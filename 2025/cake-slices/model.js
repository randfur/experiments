import {Vec3} from '../third-party/ga/vec3.js';
import {PlaneBasis} from '../third-party/ga/plane-basis.js';

class Model {
  constructor(faces) {
    this.faces = faces;
  }

  split({position, direction, cuts, distance}) {
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
