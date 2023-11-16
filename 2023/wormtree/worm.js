import {Engine} from './engine.js';
import {Vec3} from './vec3.js';
import {Rotor3} from './rotor3.js';
import {frameRange, range, sleep, never} from './utils.js';

export class Worm {
  constructor() {
    this.position = new Vec3(0, 0, 100);
    this.speed = 1;
    this.orientation = new Rotor3();
  }

  async run() {
    while (true) {
      await sleep(randomRange(1000, 3000));

    }
  }

  step() {
    this.position.setAdd(this.position, this.velocity);
  }

  draw(hexLines) {
    hexLines.addDot({
      position: this.position,
      size: 10,
      colour: {r: 255, g: 0, b: 0},
    });
  }
}
