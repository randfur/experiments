import {Engine} from './engine.js';
import {Vec3} from './third-party/ga/vec3.js';
import {Rotor3} from './third-party/ga/rotor3.js';
import {Temp} from './third-party/ga/temp.js';
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
            this.orientation.inplaceMultiplyRight(
              Temp.rotor3().setAxisAngle(
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
          await sleepFrames(randomRange(5, 20));
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
      Temp.z(),
      Temp.vec3(0, 0, 50),
      0.01,
    );
    this.position.inplaceAdd(
      Temp.z().inplaceRotateRotor(this.orientation).inplaceScale(this.speed),
    );
  }

  draw(hexLines) {
    if (this.primary) {
      const trailPosition = Temp.vec3(0, 10, 50)
        .inplaceRotateRotor(this.orientation)
        .inplaceAdd(this.position);
      Temp.mat4()
        .setTranslateVec3(Temp.vec3().setScale(-1, trailPosition))
        .inplaceMultiplyLeft(
          Temp.mat4().setRotateRotor(
            Temp.rotor3().setMultiply(
              this.orientation,
              Temp.rotor3().setTurnAround(
                Temp.z().inplaceRotateRotor(this.orientation),
                Temp.x().inplaceRotateRotor(this.orientation),
              ),
            )
          )
        )
        .exportToArrayBuffer(hexLines.transformMatrix);
    }

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
