import {Vec3} from '../../third-party/ga/vec3.js';
import {Mat4} from '../../third-party/ga/mat4.js';
import {Rotor3} from '../../third-party/ga/rotor3.js';
import {range, never, TAU} from './utils.js';

export class Arrow {
  constructor() {
    this.position = new Vec3();
    this.orientation = new Rotor3();
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

  async run() {
    await never;
  }

  step() {
    this.orientation
      .inplaceMultiplyRight(
        Rotor3.temp().setAxisAngle(Vec3.temp(0, 1, 0), TAU * 0.001 + 0.01 * Math.sin(performance.now() * 0.001))
      )
      .inplaceMultiplyRight(
        Rotor3.temp().setAxisAngle(Vec3.temp(1, 0, 0), TAU * 0.003)
      )
  }

  draw(hexLines) {
    if (this.cameraBehind) {
      Mat4.temp()
        .setTranslateVec3(
          Vec3.temp(0, 10, -50)
            .inplaceRotateRotor(this.orientation)
            .inplaceAdd(this.position)
            .inplaceScale(-1)
        )
        .inplaceMultiplyLeft(
          Mat4.temp().setRotateRotor(
            Rotor3.temp().setConjugate(this.orientation)
          )
        )
        .exportToArrayBuffer(hexLines.transformMatrix);
    } else {
      Mat4.temp()
        .setTranslateVec3(
          Vec3.temp(0, 10, 80)
            .inplaceRotateRotor(this.orientation)
            .inplaceAdd(this.position)
            .inplaceScale(-1)
        )
        .inplaceMultiplyLeft(
          Mat4.temp().setRotateRotor(
            Rotor3.temp()
              .setMultiply(
                Rotor3.temp().setTurnAround(Vec3.temp(0, 0, 1), Vec3.temp(1, 0, 0)),
                this.orientation,
              )
              .inplaceConjugate()
          )
        )
        .exportToArrayBuffer(hexLines.transformMatrix);
    }

    hexLines.addPoint({
      position: this.position,
      size: 5,
      colour: {r: 100, g: 100, b: 100},
    });
    hexLines.addPoint({
      position: Vec3.temp(0, 0, 40).inplaceRotateRotor(this.orientation).inplaceAdd(this.position),
      size: 5,
      colour: {r: 255, g: 255, b: 255},
    });
    hexLines.addNull();

    const gridSize = 100;
    const gridStep = 25;
    for (let x = -gridSize; x <= gridSize; x += gridStep) {
      for (let y = -gridSize; y <= gridSize; y += gridStep) {
        for (let z = -gridSize; z <= gridSize; z += gridStep) {
          hexLines.addDot({
            position: {x, y, z},
            size: 2,
            colour: {
              r: 2 * Math.abs(x) / (x < 0 ? 2 : 1),
              g: 2 * Math.abs(y) / (y < 0 ? 2 : 1),
              b: 2 * Math.abs(z) / (z < 0 ? 2 : 1),
            }
          });
        }
      }
    }
  }
}