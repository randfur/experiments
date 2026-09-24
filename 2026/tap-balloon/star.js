import {Vec3} from '../../third-party/ga/vec3.js';
import {starModels} from './model-data.js';
import {goodStarColour, badStarColour} from './colours.js';
import {TAU, random, deviate, drawModel} from './utils.js';

export class Star {
  constructor(game, position, starCount, bad) {
    this.alive = true;
    this.game = game;
    this.position = position;
    this.size = (10 + starCount) * (bad ? 5 : 1);
    this.angle = deviate(bad ? 0.5 : TAU);
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
      if (!this.game.gameOver) {
        this.game.score += this.bad ? -1 : 1;
      }
    }
  }

  draw(hexLines) {
    drawModel(
      hexLines,
      this.bad ? starModels.bad : starModels.good,
      this.bad ? 8 : 4,
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
