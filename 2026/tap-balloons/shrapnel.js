import {Vec3} from '../../third-party/ga/vec3.js';
import {Rotor3} from '../../third-party/ga/rotor3.js';
import {fadeColour, random, deviate} from './utils.js';
import {white} from './colours.js';

export class Shrapnel {
  constructor(start, end, velocity, size) {
    this.alive = true;
    this.position = new Vec3().setAdd(start, end).inplaceScale(0.5);
    this.modelStart = new Vec3().setDelta(this.position, start);
    this.modelEnd = new Vec3().setDelta(this.position, end);
    this.velocity = velocity;
    this.size = size;
    this.orientation = new Rotor3();
    this.orientationVelocity = new Rotor3(deviate(1), deviate(1), deviate(1), deviate(1))
      .inplaceNormalise()
      .inplaceReduce(0.05 + random(0.2));
    this.duration = 1000 + random(500);
    this.remaining = this.duration;
  }

  update(time, timeDelta) {
    this.position.inplaceScaleAdd(timeDelta, this.velocity);

    this.orientation.inplaceMultiplyRight(this.orientationVelocity);

    this.remaining -= timeDelta;
    if (this.remaining <= 0) {
      this.alive = false;
    }
  }

  draw(hexLines, textContext) {
    hexLines.addPointParts(
      Vec3.a.setAdd(
        this.position,
        Vec3.b.setRotateRotor3(this.modelStart, this.orientation),
      ),
      this.size,
      white,
    );
    hexLines.addPointParts(
      Vec3.a.setAdd(
        this.position,
        Vec3.b.setRotateRotor3(this.modelEnd, this.orientation),
      ),
      this.size,
      white,
    );
    hexLines.addNull();
  }
}
