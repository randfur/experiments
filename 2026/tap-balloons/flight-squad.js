import {Aeroplane} from './aeroplane.js';
import {stageColours} from './colours.js';
import {Vec3} from '../../third-party/ga/vec3.js';
import {randomBool, deviate} from './utils.js';

export class FlightSquad {
  constructor(game) {
    this.alive = true;
    this.game = game;
    this.aeroplanesRemaining = stageColours.length;
    this.launchesRemaining = stageColours.length;
    this.launchDelayRemaining = 0;
  }

  update(time, timeDelta) {
    if (this.launchesRemaining > 0) {
      this.launchDelayRemaining -= timeDelta;
      if (this.launchDelayRemaining <= 0) {
        this.launchDelayRemaining = launchDelayDuration;
        --this.launchesRemaining;

        const sign = randomBool() ? 1 : -1;
        const launchDirection = randomBool() ? new Vec3(sign, 0) : new Vec3(0, sign);
        const launchLength = Math.abs(Vec3.xyz(this.game.width, this.game.height).dot(launchDirection)) + 2 * Aeroplane.size;
        const colour = stageColours[this.launchesRemaining];
        this.game.entities.push(
          new Aeroplane(
            this.game,
            this,
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

  draw(hexLines, textContext) {
  }
}

const launchDelayDuration = 3000;