import {Vec3} from '../../third-party/ga/vec3.js';
import {Rotor3} from '../../third-party/ga/rotor3.js';
import {fadeColour, random, deviate} from './utils.js';
import {white} from './colours.js';

export class Shrapnel {
  static createForModel(game, model, position, transform, velocityFunction, thickness, colour) {
    for (let i = 0; i < model.length - 1; ++i) {
      const modelStart = model[i];
      const modelEnd = model[i + 1];
      if (modelStart === null || modelEnd === null) {
        continue;
      }
      const start = transform(new Vec3().set(modelStart))
      const end = transform(new Vec3().set(modelEnd))
      game.entities.push(
        new Shrapnel(
          start,
          end,
          velocityFunction(
            new Vec3()
              .setAdd(start, end)
              .inplaceScale(0.5)
              .inplaceSubtract(position),
          ),
          thickness,
          colour,
        ),
      );
    }
  }

  constructor(start, end, velocity, thickness, colour) {
    this.alive = true;
    this.position = new Vec3().setAdd(start, end).inplaceScale(0.5);
    this.modelStart = new Vec3().setDelta(this.position, start);
    this.modelEnd = new Vec3().setDelta(this.position, end);
    this.velocity = velocity;
    this.thickness = thickness;
    this.colour = colour;
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

  draw(hexLines) {
    hexLines.addPointParts(
      Vec3.a.setAdd(
        this.position,
        Vec3.b.setRotateRotor3(this.modelStart, this.orientation),
      ),
      this.thickness,
      this.colour,
    );
    hexLines.addPointParts(
      Vec3.a.setAdd(
        this.position,
        Vec3.b.setRotateRotor3(this.modelEnd, this.orientation),
      ),
      this.thickness,
      this.colour,
    );
    hexLines.addNull();
  }
}
