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
    if (this.lifeElapsed > lifeDuration) {
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
    if (Vec3.delta(this.position, position).squareLength() > Aeroplane.size ** 2) {
      return;
    }

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

    for (let i = 0; i < aeroplaneModel.length - 1; ++i) {
      const modelStart = aeroplaneModel[i];
      const modelEnd = aeroplaneModel[i + 1];
      if (modelStart === null || modelEnd === null) {
        continue;
      }
      const start = this.transform(new Vec3().set(modelStart))
      const end = this.transform(new Vec3().set(modelEnd))
      const deviation = 0.01;
      this.game.entities.push(
        new Shrapnel(
          start,
          end,
          new Vec3()
            .setAdd(start, end)
            .inplaceScale(0.5)
            .inplaceSubtract(this.position)
            .inplaceScale(0.01)
            .inplaceAdd(this.velocity)
            .inplaceAddXyz(deviate(deviation), deviate(deviation), 200 * deviate(deviation)),
          thickness,
        ),
      );
    }

    for (let i = 0; i < 100; ++i) {
      const direction = new Vec3().setPolar(random(TAU), random(1)).inplaceAddXyz(0, 0, deviate(1));
      this.game.entities.push(
        new Exhaust(
          this.transform(direction.clone()),
          this.velocity.clone().inplaceScale(0.2 + random(0.5)),
          this.transform(direction.clone()).inplaceSubtract(this.position).inplaceScale(0.02),
          this.colour,
        ),
      );
    }
  }

  transform(position) {
    return position
      .inplaceScale(Aeroplane.size)
      .inplaceRotateXy(this.launchDirection)
      .inplaceRotateRotor3(Rotor3.axisAngle(this.launchDirection, this.roll))
      .inplaceRotateXyAngle(this.roll / 3)
      .inplaceAdd(this.position);
  }

  draw(hexLines, textContext) {
    drawModel(hexLines, aeroplaneModel, thickness, white, position => this.transform(Vec3.set(position)));
  }
}

const lifeDuration = 1500;
const exhaustDelayDuration = 20;
const thickness = 5;