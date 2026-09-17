import {Vec3} from '../../third-party/ga/vec3.js';
import {random} from './utils.js';

export class Star {
  constructor(game, position, size) {
    this.alive = true;
    this.game = game;
    this.position = position;
    this.size = size;
    this.angle = 0;
    this.angleVelocity = size / 1000;
    this.angleAcceleration = 1 / 100;
    this.velocity = new Vec3(0, -random(10));
    this.yAcceleration = size / 4;
  }

  update(time, timeDelta) {
    this.angle += this.angleVelocity;
    this.angleVelocity += this.angleAcceleration;

    this.position.inplaceAdd(this.velocity);
    this.position.x -= this.position.x / 10;
    this.velocity.y += this.yAcceleration;

    if (this.position.y > this.game.height / 2) {
      this.alive = false;
      this.game.score += 1;
      this.game.highScore = Math.max(this.game.highScore, this.game.score);
    }
  }

  draw(hexLines, textContext) {
    for (const point of starModelPoints) {
      hexLines.addPointParts(
        Vec3.set(point).inplaceScale(this.size).inplaceRotateXyAngle(this.angle).inplaceAdd(this.position),
        5,
        starColour,
      );
    }
    hexLines.addNull();
  }
}

const starColour = {r: 255, g: 200, b: 100};

const starModelPoints = [
  new Vec3(-0.62, 0.77),
  new Vec3(0.98, 0.27),
  new Vec3(-0.85, -0.59),
  new Vec3(0.19, 0.95),
  new Vec3(0.33, -0.94),
  new Vec3(-0.59, 0.76),
];
