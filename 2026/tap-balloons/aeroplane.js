import {Vec3} from '../../third-party/ga/vec3.js';
import {Rotor3} from '../../third-party/ga/rotor3.js';
import {aeroplaneModel} from './model-data.js';
import {StarEmitter} from './star-emitter.js';
import {Exhaust} from './exhaust.js';
import {Shockwave} from './shockwave.js';
import {Shrapnel} from './shrapnel.js';
import {white} from './colours.js';
import {TAU, random, deviate, randomBool, drawModel} from './utils.js';

export class Aeroplane {
  static size = 100;

  constructor(game, flightSquad, lifeDuration, colour, position, launchDirection, launchLength) {
    this.alive = true;
    this.game = game;
    this.flightSquad = flightSquad;
    this.lifeDuration = lifeDuration;
    this.colour = colour;
    this.launchDirection = launchDirection;
    this.position = position;
    this.radius = Aeroplane.size;
    this.velocity = launchDirection.clone().inplaceScale(launchLength / this.lifeDuration);
    this.roll = 0;
    this.lifeElapsed = 0;
    this.rollDirection = randomBool() ? 1 : -1;
    this.exhaustDelayRemaining = exhaustDelayDuration;
  }

  update(time, timeDelta) {
    this.roll = this.rollDirection * 1.5 * Math.cos(this.lifeElapsed / 200);
    this.velocity.inplaceScaleAdd(timeDelta * this.roll / 500, Vec3.turnXy(this.launchDirection));
    this.position.inplaceScaleAdd(timeDelta, this.velocity);

    this.exhaustDelayRemaining -= timeDelta;
    if (this.exhaustDelayRemaining <= 0) {
      this.exhaustDelayRemaining = exhaustDelayDuration;
      this.game.entities.push(
        this.createExhaust(0.1),
        this.createExhaust(-0.1),
      );
    }

    this.lifeElapsed += timeDelta;
    if (this.lifeElapsed > this.lifeDuration) {
      this.alive = false;
    }
  }

  createExhaust(yOffset) {
    return new Exhaust(
      this.transform(new Vec3(-1, yOffset)),
      this.velocity.clone().inplaceScale(0.1),
      this.transform(new Vec3(-0.1, yOffset))
        .inplaceSubtract(this.position)
        .inplaceScale(0.02),
      this.colour,
    );
  }

  click(position) {
    if (Vec3.delta(this.position, position).squareLength() > this.radius ** 2) {
      return;
    }

    this.alive = false;
    this.game.popCheck = true;
    this.game.incrementCombo();
    this.flightSquad.maybeScheduleLaunch();

    this.game.entities.push(
      new StarEmitter(
        this.game,
        this.position.clone(),
        this.radius,
        this.game.comboLevel,
        /*bad=*/false,
      ),
    );

    for (let i = 0; i < 2; ++i) {
      Shrapnel.createForModel(
        this.game,
        aeroplaneModel,
        this.position,
        position => this.transform(position),
        velocity => velocity
          .inplaceScale(0.01)
          .inplaceScaleAdd(0.5 + random(0.5), this.velocity)
          .inplaceAddXyz(deviate(0.01), deviate(0.01), deviate(2)),
        thickness,
        i === 0 ? white : this.colour,
      );
    }
  }

  transform(position) {
    return position
      .inplaceScale(this.radius)
      .inplaceRotateXy(this.launchDirection)
      .inplaceRotateRotor3(Rotor3.axisAngle(this.launchDirection, this.roll))
      .inplaceRotateXyAngle(this.roll / 3)
      .inplaceAdd(this.position);
  }

  draw(hexLines) {
    drawModel(hexLines, aeroplaneModel, thickness, white, position => this.transform(Vec3.set(position)));
  }
}

const exhaustDelayDuration = 20;
const thickness = 10;