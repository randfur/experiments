import {Engine} from './engine.js';
import {Flame} from './flame.js';
import {Vec3} from '../../third-party/ga/vec3.js';
import {Mat4} from '../../third-party/ga/mat4.js';
import {Rotor3} from '../../third-party/ga/rotor3.js';
import {
  secondsRange,
  never,
  randomRange,
  deviate,
  range,
  sleepSeconds,
  random,
  progressSmooth,
  progressUpDown,
  TAU,
} from './utils.js';

export class Ember {
  constructor({follow}={follow: false}) {
    this.follow = follow;
    this.position = new Vec3();
    this.maxSpeed = 100;
    this.maxSpeedDuration = 60;
    this.size = 10;
    this.orientation = new Rotor3();
    if (this.follow) {
      this.cameraBehind = true;
      window.addEventListener('keydown', event => {
        if (event.code === 'Space') {
          this.cameraBehind ^= true;
        }
      });
      window.addEventListener('pointerdown', event => {
        this.cameraBehind ^= true;
      });
    }
  }

  async run() {
    (async () => {
      while (!this.done) {
        (async () => {
          const axis = new Vec3(deviate(1), deviate(1), deviate(1)).inplaceNormalise();
          const maxAngle = TAU * 0.06 * randomRange(1, 5);
          for await (const {progress, secondsDelta} of secondsRange(randomRange(3, 8))) {
            if (this.done) {
              return;
            }
            this.orientation.inplaceMultiplyRight(
              Rotor3.temp().setAxisAngle(
                axis,
                progressSmooth(progressUpDown(progress)) * maxAngle * secondsDelta,
              )
            );
          }
        })();

        await sleepSeconds(randomRange(1, 2));
      }
    })();

    (async () => {
      while (!this.done) {
        await sleepSeconds(randomRange(0.05, 0.12));
        Engine.add(new Flame(this.position.clone(), this.orientation.clone()));
      }
    })();
    await never;
  }

  step(secondsDelta) {
    this.orientation.inplaceTurnTo(
      this.position,
      Vec3.temp(0, 0, 1),
      Vec3.temp(),
      0.005,
    );
    const speed = progressSmooth(Math.min(Engine.seconds / this.maxSpeedDuration, 1)) * this.maxSpeed;
    this.position.inplaceAdd(
      Vec3.temp(0, 0, 1).inplaceRotateRotor(this.orientation).inplaceScale(speed * secondsDelta),
    );
  }

  draw(hexLines) {
    if (this.follow) {
      if (this.cameraBehind) {
        const trailPosition = Vec3.temp(0, 30, -150)
          .inplaceRotateRotor(this.orientation)
          .inplaceAdd(this.position);
        Mat4.temp()
          .setTranslateVec3(Vec3.temp().setScale(-1, trailPosition))
          .inplaceMultiplyLeft(
            Mat4.temp().setRotateRotor(
              Rotor3.temp()
                .inplaceMultiplyRight(this.orientation)
                .inplaceConjugate()
            )
          )
          .exportToArrayBuffer(hexLines.transformMatrix);
      } else {
        const trailPosition = Vec3.temp(0, 20, 60)
          .inplaceRotateRotor(this.orientation)
          .inplaceAdd(this.position);
        Mat4.temp()
          .setTranslateVec3(Vec3.temp().setScale(-1, trailPosition))
          .inplaceMultiplyLeft(
            Mat4.temp().setRotateRotor(
              Rotor3.temp()
                .setTurnAround(Vec3.temp(0, 0, 1), Vec3.temp(1, 0, 0))
                .inplaceMultiplyRight(this.orientation)
                .inplaceConjugate()
            )
          )
          .exportToArrayBuffer(hexLines.transformMatrix);
      }
    }

    hexLines.addDot({
      position: this.position,
      size: this.size,
      colour: {r: 255, g: 255, b: 200},
    });
  }
}
