import {Vec3} from '../../third-party/ga/vec3.js';
import {random, TAU} from './utils.js';

export class Star {
  constructor(game, position, starCount) {
    this.alive = true;
    this.game = game;
    this.position = position;
    this.size = 5 + starCount;
    this.angle = random(TAU);
    this.velocity = new Vec3(0, -random(1));
    this.yAcceleration = this.size / 200;
  }

  update(time, timeDelta) {
    this.position.inplaceScaleAdd(timeDelta, this.velocity);
    this.position.x -= this.position.x / 10;
    this.velocity.y += timeDelta * this.yAcceleration;

    if (this.position.y > this.game.height / 2) {
      this.alive = false;
      this.game.score += 1;
      this.game.highScore = Math.max(this.game.highScore, this.game.score);
    }
  }

  draw(hexLines, textContext) {
    for (const point of starModel) {
      hexLines.addPointParts(
        Vec3
          .set(point)
          .inplaceScale(this.size)
          .inplaceRotateXyAngle(this.angle)
          .inplaceAdd(this.position),
        5,
        starColour,
      );
    }
    hexLines.addNull();
  }
}

const starColour = {r: 255, g: 200, b: 50};

const starModel = [
  new Vec3(-0.62, 0.77),
  new Vec3(0.98, 0.27),
  new Vec3(-0.85, -0.59),
  new Vec3(0.19, 0.95),
  new Vec3(0.33, -0.94),
  new Vec3(-0.59, 0.76),
];
