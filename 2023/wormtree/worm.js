import {Engine} from './engine.js';
import {Vec3} from './vec3.js';
import {Rotor3} from './rotor3.js';
import {
  frameRangeProgress,
  never,
  randomRange,
  deviate,
  range,
  sleep,
  random,
  progressSmooth,
  progressUpDown,
  TAU,
} from './utils.js';

export class Worm {
  constructor(position=null, orientation=null) {
    this.primary = position === null;
    this.position = position ?? new Vec3(0, 0, 100);
    this.speed = this.primary ? 1 : 0.9;
    this.orientation = orientation ?? new Rotor3();
    this.size = 10;
    this.maxLife = 1000;
    this.life = this.maxLife;
  }

  async run() {
    (async () => {
      while (!this.done) {
        (async () => {
          const axis = new Vec3(deviate(1), deviate(1), deviate(1)).inplaceNormalise();
          const maxAngle = TAU * 0.001 * randomRange(1, 5);
          for await (const progress of frameRangeProgress(randomRange(300, 1000))) {
            this.orientation.inplaceMultiply(
              Rotor3.getTemp().setAxisAngle(
                axis,
                progressSmooth(progressUpDown(progress)) * maxAngle,
              )
            );
          }
        })();

        await sleep(randomRange(500, 1000));
      }
    })();

    if (this.primary) {
      (async () => {
        while (!this.done) {
          await sleep(randomRange(100, 300));
          Engine.add(new Worm(this.position.clone(), this.orientation.clone()));
        }
      })();
      await never;
    }

    while (this.life > 0) {
      await Engine.nextFrame;
      --this.life;
    }
  }

  step() {
    this.position.inplaceAdd(
      Vec3.getTemp(0, 0, 1).inplaceRotateRotor(this.orientation).inplaceScale(this.speed),
    );
  }

  draw(hexLines) {
    const lifeProgress = this.life / this.maxLife;
    hexLines.addDot({
      position: this.position,
      size: this.size * lifeProgress,
      colour: this.primary ? {r: 255, g: 255, b: 255} : {r: 255 * lifeProgress, g: 0, b: 0},
    });
  }
}
