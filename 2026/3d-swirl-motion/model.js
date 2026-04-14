import {Vec3} from '../../third-party/ga/vec3.js';
import {Rotor3} from '../../third-party/ga/rotor3.js';

export class Model {
  constructor(originalPoints) {
    this.originalPoints = originalPoints;
    this.transformedPoints = originalPoints.map(
      point => point
        ? {
          position: point.position.clone(),
          size: point.size,
          colour: structuredClone(point.colour),
        }
        : null
    );

    this.translate = new Vec3();
    this.scale = 1;
    this.rotate = new Rotor3();
    this.colourOverride = null;
  }

  transformPoints() {
    for (let i = 0; i < this.transformedPoints.length; ++i) {
      const originalPoint = this.originalPoints[i];
      if (originalPoint !== null) {
        this.transformedPoints[i].position
          .set(originalPoint.position)
          .inplaceScale(this.scale)
          .inplaceRotateRotor3(this.rotate)
          .inplaceAdd(this.translate);
        this.transformedPoints[i].colour = this.colourOverride ?? originalPoint.colour;
      }
    }
  }
}
