import {Aeroplane} from './aeroplane.js';
import {stageColours} from './colours.js';
import {Vec3} from '../../third-party/ga/vec3.js';
import {randomBool, random} from './utils.js';

export class FlightSquad {
  constructor(game) {
    this.alive = true;
    this.game = game;
    this.aeroplanesRemaining = stageColours.length;
    this.launchDelayRemaining = null;
    this.destroyed = false;
    this.maybeScheduleLaunch()
  }

  maybeScheduleLaunch() {
    if (this.aeroplanesRemaining <= 0) {
      this.destroyed = true;
      return;
    }

    this.launchDelayRemaining = 1000 + random(2000);
  }

  update(time, timeDelta) {
    if (this.launchDelayRemaining !== null) {
      this.launchDelayRemaining -= timeDelta;
      if (this.launchDelayRemaining <= 0) {
        this.launchDelayRemaining = null;
        --this.aeroplanesRemaining;
        const sign = randomBool() ? 1 : -1;
        const launchDirection = randomBool() ? new Vec3(sign, 0) : new Vec3(0, sign);
        const launchLength = Math.abs(Vec3.xyz(this.game.width, this.game.height).dot(launchDirection)) + 4 * Aeroplane.size;
        const colour = stageColours[stageColours.length - 1 - this.aeroplanesRemaining];
        this.game.entities.push(
          new Aeroplane(
            this.game,
            this,
            1200 + 200 * this.aeroplanesRemaining,
            colour,
            new Vec3()
              .setScale(-launchLength / 2, launchDirection),
            launchDirection,
            launchLength,
          ),
        );
      }
    }
  }
}
