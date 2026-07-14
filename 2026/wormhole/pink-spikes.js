import {Vec3} from '../../third-party/ga/vec3.js';
import {Rotor3} from '../../third-party/ga/rotor3.js';

const TAU = Math.PI * 2;

export class PinkSpikes {
  constructor() {
    this.distance = 0;

    const base = {r: 255, g: 50, b: 200};
    const peak = {r: 255, g: 120, b: 255};
    this.spikePoints = [{
      position: new Vec3(0, 0.5),
      colour: base,
      size: 2,
    }, {
      position: new Vec3(1, 0),
      colour: peak,
      size: 1,
    }, {
      position: new Vec3(0, -0.5),
      colour: base,
      size: 2,
    }];
  }

  render(hexLines, time, path, nearDistance, farDistance) {
    const step = 50;
    let pathDistance = roundTo(this.distance, nearDistance, step);
    while (pathDistance < farDistance) {
      const point = path.getPointByDistance(pathDistance);
      const delta = pathDistance - this.distance;
      const radius = 20 + 30 * (Math.cos(delta / 700 + 1) + 1);
      const startAngle = delta / 300 + 5 * Math.cos(time / 5000) * (Math.cos(delta / 1000) + 1.5);
      const spokes = 10 + 6 * Math.cos(delta / 1500);
      const scaleX = 12 + 8 * Math.cos(delta / 6500 + 3);
      const scaleY = Math.min(14 + 5 * Math.cos(delta / 9000 + 10), TAU * radius / spokes / 2);

      for (let i = 0; i < spokes; ++i) {
        rotation.setPolar(startAngle + TAU * i / spokes);

        const squishMax = 10 * Math.cos(TAU * (Math.cos(delta / 5000) + 1)) * Math.cos(delta / 3000);
        const squishDirection = Vec3.a.setPolar(delta / 8500);
        const squish = squishMax * rotation.dot(squishDirection);

        for (let j = 0; j <= this.spikePoints.length; ++j) {
          const spikePoint = this.spikePoints[j % this.spikePoints.length];
          hexLines.addPointParts(
            Vec3.set(spikePoint.position)
              .inplaceScaleXyz(scaleX, scaleY)
              .inplaceAddXyz(radius + squish)
              .inplaceRotateXy(rotation)
              .inplaceRotateRotor3(point.orientation)
              .inplaceAdd(point.position),
            spikePoint.size,
            spikePoint.colour,
          );
        }
        hexLines.addNull();
      }

      pathDistance += step;
    }
  }
}

const rotation = new Vec3();

function roundTo(origin, x, step) {
  return origin + Math.round((x - origin) / step) * step;
}