import {Vec3} from '../../third-party/ga/vec3.js';
import {Rotor3} from '../../third-party/ga/rotor3.js';
import {aeroplaneModel} from './model-data.js';
import {StarEmitter} from './star-emitter.js';
import {Shockwave} from './shockwave.js';
import {white} from './colours.js';
import {TAU, randomBool, drawModel} from './utils.js';

export class Aeroplane {
  static size = 70;

  constructor(game, flightSquad, colour, position, launchDirection, launchLength) {
    this.alive = true;
    this.game = game;
    this.flightSquad = flightSquad;
    this.colour = colour;
    this.launchDirection = launchDirection;
    this.position = position;
    this.velocity = launchDirection.clone().inplaceScale(launchLength / lifeDuration);
    this.roll = 0;
    this.lifeElapsed = 0;
    this.rollDirection = randomBool() ? 1 : -1;
  }

  update(time, timeDelta) {
    this.lifeElapsed += timeDelta;
    this.roll = this.rollDirection * 1.5 * Math.cos(this.lifeElapsed / 200);
    this.velocity.inplaceScaleAdd(timeDelta * this.roll / 500, Vec3.turnXy(this.launchDirection));
    this.position.inplaceScaleAdd(timeDelta, this.velocity);
    if (this.lifeElapsed > lifeDuration) {
      this.alive = false;
    }
  }

  click(position) {
    if (Vec3.delta(this.position, position).squareLength() < Aeroplane.size ** 2) {
      this.alive = false;
      --this.flightSquad.aeroplanesRemaining;
      this.game.popCheck = true;
      this.game.incrementCombo();
      this.game.entities.push(
        new StarEmitter(
          this.game,
          this.position.clone(),
          Aeroplane.size,
          this.game.comboLevel,
          /*bad=*/false,
        ),
      );
    }
  }

  draw(hexLines, textContext) {
    drawModel(hexLines, aeroplaneModel, 6, white, point => {
      return Vec3
        .set(point)
        .inplaceScale(Aeroplane.size)
        .inplaceRotateXy(this.launchDirection)
        .inplaceRotateRotor3(Rotor3.axisAngle(this.launchDirection, this.roll))
        .inplaceRotateXyAngle(this.roll / 8)
        .inplaceAdd(this.position);
    });
  }
}

const lifeDuration = 1500;