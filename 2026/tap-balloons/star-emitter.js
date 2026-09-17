import {Vec3} from '../../third-party/ga/vec3.js';
import {Star} from './star.js';
import {random, TAU} from './utils.js';

export class StarEmitter {
  constructor(game, position, radius, count) {
    this.alive = true;
    this.game = game;
    this.position = position;
    this.radius = radius;
    this.delayRemaining = 0;
    this.starsRemaining = count;
    this.starCount = 0;
  }

  update(time, timeDelta) {
    this.delayRemaining -= timeDelta;
    if (this.delayRemaining <= 0) {
      this.game.entities.push(new Star(
        this.game,
        new Vec3().setPolar(random(TAU), random(this.radius)).inplaceAdd(this.position),
        this.starCount,
      ));
      ++this.starCount;
      --this.starsRemaining;
      this.delayRemaining = delayDuration;
    }
    if (this.starsRemaining <= 0) {
      this.alive = false;
    }
  }

  draw(hexLines, textContext) {
  }
}

const delayDuration = 20;