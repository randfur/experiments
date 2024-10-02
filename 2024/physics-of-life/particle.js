import {LineDrawing} from './third-party/hex-lines/src/2d/line-drawing.js';
import {sleep, once, deviate} from './utils.js';

export class Particle {
  static size = 20;

  static ensureInit = once((hexLines2d) => {
    Particle.lineBuffer = hexLines2d.createLineBuffer();
    Particle.lineBuffer.addDot({
      position: {x: 0, y: 0},
      size: Particle.size,
      colour: {r: 255, g: 255, b: 255},
    });
  });

  constructor(hexLines2d) {
    Particle.ensureInit(hexLines2d);

    this.drawing = new LineDrawing({lineBuffer: Particle.lineBuffer});
    this.position = {
      x: deviate(200),
      y: deviate(200),
    };

    this.velocity = {
      x: deviate(4),
      y: deviate(4),
    };
  }

  step() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  draw() {
    this.drawing.transform = new Float32Array([
      1, 0, this.position.x,
      0, 1, this.position.y,
      0, 0, 1,
    ]);
    return this.drawing;
  }
}
