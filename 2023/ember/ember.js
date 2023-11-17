import {Engine} from './engine.js';
import {Vec3} from './vec3.js';
import {Rotor3} from './rotor3.js';
import {
  frameRangeProgress,
  never,
  randomRange,
  deviate,
  range,
  sleepFrames,
  random,
  progressSmooth,
  progressUpDown,
  TAU,
} from './utils.js';

export class Ember {
  constructor(position=null, orientation=null) {
    this.primary = position === null;
    this.position = position ?? new Vec3(0, 0, 0);
    this.speed = this.primary ? 1 : 0.3;
    this.baseForward = new Vec3(0, 0, 1);
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
          for await (const progress of frameRangeProgress(randomRange(200, 500))) {
            if (this.done) {
              return;
            }
            this.orientation.inplaceMultiply(
              Rotor3.getTemp().setAxisAngle(
                axis,
                progressSmooth(progressUpDown(progress)) * maxAngle,
              )
            );
          }
        })();

        await sleepFrames(randomRange(50, 100));
      }
    })();

    if (this.primary) {
      (async () => {
        while (!this.done) {
          await sleepFrames(randomRange(10, 30));
          Engine.add(new Ember(this.position.clone(), this.orientation.clone()));
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
    this.orientation.inplaceTurnTo(
      this.position,
      this.baseForward,
      Vec3.getTemp(0, 0, 50),
      0.01,
    );
    this.position.inplaceAdd(
      Vec3.getTemp().set(this.baseForward).inplaceRotateRotor(this.orientation).inplaceScale(this.speed),
    );
  }

  draw(hexLines) {
    const lifeProgress = this.life / this.maxLife;
    hexLines.addDot({
      position: this.position,
      size: this.size * lifeProgress,
      colour: this.primary
        ? {r: 255, g: 255, b: 0}
        : {
          r: 255 * lifeProgress,
          g: Math.max(255 * (lifeProgress - 1 + 0.1) / 0.1, 0),
          b: 0,
        },
    });
  }
}
