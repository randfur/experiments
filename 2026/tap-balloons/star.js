import {Vec3} from '../../third-party/ga/vec3.js';
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

  draw(hexLines, textContext) {
    drawModel(
      hexLines,
      this.bad ? badStarModel : starModel,
      4,
      this.bad ? badStarColour : starColour,
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

const starColour = {r: 255, g: 200, b: 50};
const badStarColour = {r: 100, g: 100, b: 100};

const starModel = [
  new Vec3(-0.62, 0.77),
  new Vec3(0.98, 0.27),
  new Vec3(-0.85, -0.59),
  new Vec3(0.19, 0.95),
  new Vec3(0.33, -0.94),
  new Vec3(-0.59, 0.76),
  null,
];

const badStarModel = [
  new Vec3(0.00, 0.94),
  new Vec3(-0.42, 0.81),
  new Vec3(-0.55, 0.43),
  new Vec3(-0.20, 0.25),
  new Vec3(-0.19, 0.01),
  new Vec3(-0.00, -0.13),
  new Vec3(0.25, -0.02),
  new Vec3(0.25, 0.25),
  new Vec3(0.61, 0.43),
  new Vec3(0.44, 0.84),
  new Vec3(0.01, 0.95),
  null,
  new Vec3(-0.76, 0.29),
  new Vec3(-0.97, 0.23),
  new Vec3(-0.91, 0.11),
  new Vec3(-1.06, 0.02),
  new Vec3(-0.95, -0.08),
  new Vec3(-0.72, -0.05),
  new Vec3(0.61, -0.58),
  new Vec3(0.65, -0.75),
  new Vec3(0.84, -0.70),
  new Vec3(0.85, -0.56),
  new Vec3(1.01, -0.47),
  new Vec3(0.90, -0.26),
  new Vec3(0.59, -0.33),
  new Vec3(-0.64, 0.12),
  new Vec3(-0.76, 0.28),
  null,
  new Vec3(-0.75, -0.36),
  new Vec3(-0.95, -0.33),
  new Vec3(-1.02, -0.51),
  new Vec3(-0.81, -0.59),
  new Vec3(-0.76, -0.75),
  new Vec3(-0.57, -0.67),
  new Vec3(-0.58, -0.51),
  new Vec3(0.84, -0.02),
  new Vec3(0.99, -0.06),
  new Vec3(1.09, 0.08),
  new Vec3(0.97, 0.16),
  new Vec3(0.92, 0.33),
  new Vec3(0.72, 0.29),
  new Vec3(0.67, 0.12),
  new Vec3(-0.76, -0.36),
  null,
  new Vec3(-0.07, 0.74),
  new Vec3(-0.08, 0.47),
  new Vec3(-0.34, 0.62),
  new Vec3(-0.09, 0.75),
  null,
  new Vec3(0.13, 0.75),
  new Vec3(0.08, 0.49),
  new Vec3(0.30, 0.61),
  new Vec3(0.13, 0.74),
  null,
];