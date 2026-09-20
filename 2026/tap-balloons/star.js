import {Vec3} from '../../third-party/ga/vec3.js';
import {starModels} from './model-data.js';
import {goodStarColour, badStarColour} from './colours.js';
import {TAU, random, deviate, drawModel} from './utils.js';

export class Star {
  constructor(game, position, starCount, bad) {
    this.alive = true;
    this.game = game;
    this.position = position;
    this.size = 10 + starCount;
    this.angle = deviate(0.5);
    this.velocity = bad ? new Vec3().setPolar(random(TAU), 1) : new Vec3(0, -0.5 - random(0.5));
    this.yAcceleration = 10 / 1000;
    this.bad = bad;
  }

  update(time, timeDelta) {
    this.position.inplaceScaleAdd(timeDelta, this.velocity);
    if (!this.bad) {
      this.position.x -= timeDelta * this.position.x / 1000;
    }
    this.velocity.y += timeDelta * this.yAcceleration;

    if (this.position.y > this.game.height / 2) {
      this.alive = false;
      this.game.score += this.bad ? -1 : 1;
    }
  }

  draw(hexLines) {
    drawModel(
      hexLines,
      this.bad ? starModels.bad : starModels.good,
      4,
      this.bad ? badStarColour : goodStarColour,
      point => {
        return Vec3
          .set(point)
          .inplaceScale(this.size)
          .inplaceRotateXyAngle(this.angle)
          .inplaceAdd(this.position);
      },
    );
  }
}
