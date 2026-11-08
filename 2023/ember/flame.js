import {Engine} from './engine.js';
import {Vec3} from '../../third-party/ga/src/vec3.js';
import {
  randomRange,
  deviate,
} from './utils.js';

export class Flame {
  constructor(position, orientation) {
    this.position = position;
    this.speed = randomRange(1, 4);
    this.velocity = new Vec3(0, 0, 1)
      .rotateRotor3(orientation)
      .add(Vec3.setXyz(deviate(1), deviate(1), deviate(1)))
      .normalise();
    this.size = 10;
    this.maxLife = 1000;
    this.life = this.maxLife;
  }

  async run() {
    while (this.life > 0) {
      await Engine.nextFrame;
      --this.life;
    }
  }

  step(secondsDelta) {
    this.position.add(
      Vec3.set(this.velocity).scale(this.speed * secondsDelta),
    );
  }

  draw(hexLines) {
    const lifeProgress = this.life / this.maxLife;
    hexLines.addDot({
      position: this.position,
      size: this.size * lifeProgress,
      colour:  {
        r: 255 * lifeProgress,
        g: Math.max(255 * (lifeProgress - 1 + 0.1) / 0.1, 0),
        b: 0,
      },
    });
  }
}
