import {Engine} from './engine.js';
import {Entity} from './entity.js';
import {LineDrawing} from './third-party/hex-lines/src/2d/line-drawing.js';
import {sleep, once, deviate} from './utils.js';

export class Ship extends Entity {
  static init = once(function() {
    this.lineBuffer = Engine.hexLines2d.createLineBuffer();
    this.lineBuffer.addLine([
      {position: {x: 0, y: 0}, size: 10, colour: {r: 255, g: 255, b: 255}},
      {position: {x: 100, y: 50}, size: 10, colour: {r: 255, g: 255, b: 255}},
      {position: {x: 50, y: 100}, size: 10, colour: {r: 255, g: 255, b: 255}},
      {position: {x: 0, y: 0}, size: 10, colour: {r: 255, g: 255, b: 255}},
    ]);
  });

  constructor() {
    super();
    Ship.init();

    this.drawing = new LineDrawing({lineBuffer: Ship.lineBuffer});
    this.position = {
      x: 0,
      y: 0,
    };
  }

  async run() {
    while (true) {
      await this.deathCheck(Engine.nextFrame);
      this.position.x += deviate(10);
      this.position.y += deviate(10);
    }
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
