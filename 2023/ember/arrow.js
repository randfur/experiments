import {Vec3} from '../../third-party/ga/src/vec3.js';
import {Mat4} from '../../third-party/ga/src/mat4.js';
import {Rotor3} from '../../third-party/ga/src/rotor3.js';
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
      .multiply(
        Rotor3.setAxisAngle(Vec3.setXyz(0, 1, 0), TAU * 0.001 + 0.01 * Math.sin(performance.now() * 0.001))
      )
      .multiply(
        Rotor3.setAxisAngle(Vec3.setXyz(1, 0, 0), TAU * 0.003)
      )
  }

  draw(hexLines) {
    if (this.cameraBehind) {
      Mat4.setTranslateVec3(
          Vec3.setXyz(0, 10, -50)
            .rotateRotor3(this.orientation)
            .add(this.position)
            .scale(-1)
        )
        .leftRotateRotor3(
          Rotor3.setConjugate(this.orientation)
        )
        .exportToBuffer(hexLines.transformMatrix);
    } else {
      Mat4.setTranslateVec3(
          Vec3.setXyz(0, 10, 80)
            .rotateRotor3(this.orientation)
            .add(this.position)
            .scale(-1)
        )
        .leftRotateRotor3(
          Rotor3
            .setTurnAround(Vec3.setXyz(0, 0, 1), Vec3.setXyz(1, 0, 0))
            .multiply(this.orientation)
            .conjugate()
        )
        .exportToBuffer(hexLines.transformMatrix);
    }

    hexLines.addPoint({
      position: this.position,
      size: 5,
      colour: {r: 100, g: 100, b: 100},
    });
    hexLines.addPoint({
      position: Vec3.setXyz(0, 0, 40).rotateRotor3(this.orientation).add(this.position),
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